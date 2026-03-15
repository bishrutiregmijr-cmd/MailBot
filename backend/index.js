require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { google } = require('googleapis');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mailbot-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
}));

// ── Google OAuth2 client ─────────────────────────────────────────────────────

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
  );
}

// ── Anthropic client ─────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'MailBot API running 🚀' });
});

// Step 1: Redirect user to Google login
app.get('/auth/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
  res.redirect(url);
});

// Step 2: Google redirects back here with a code
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code returned from Google');

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;

    // Fetch user profile
    oauth2Client.setCredentials(tokens);
    const people = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await people.userinfo.get();
    req.session.user = { name: data.name, email: data.email, picture: data.picture };

    res.redirect(process.env.FRONTEND_URL + '/dashboard' || 'http://localhost:5173/dashboard');
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current session user
app.get('/auth/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: req.session.user });
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ── Gmail Routes ─────────────────────────────────────────────────────────────

// Fetch latest emails (limit 20)
app.get('/api/emails', requireAuth, async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(req.session.tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // List recent message IDs
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: ['INBOX'],
    });

    const messages = listRes.data.messages || [];

    // Fetch each message
    const emails = await Promise.all(
      messages.map(async ({ id }) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = msg.data.payload.headers;
        const get = (name) => headers.find(h => h.name === name)?.value || '';

        return {
          id,
          from: get('From'),
          subject: get('Subject'),
          date: get('Date'),
          snippet: msg.data.snippet,
          labelIds: msg.data.labelIds || [],
        };
      })
    );

    res.json({ emails });
  } catch (err) {
    console.error('Fetch emails error:', err.message);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Categorize a single email with AI
app.post('/api/emails/:id/categorize', requireAuth, async (req, res) => {
  const { subject, from, snippet } = req.body;

  if (!subject && !snippet) {
    return res.status(400).json({ error: 'subject and snippet are required' });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Categorize this email into exactly ONE of: Urgent, Newsletter, Receipt, Work, Personal, Spam, Other.
Respond ONLY with a JSON object: {"category": "<category>", "reason": "<one sentence reason>"}

From: ${from}
Subject: ${subject}
Snippet: ${snippet}`
      }]
    });

    const raw = response.content[0].text.trim();
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.json(parsed);
  } catch (err) {
    console.error('Categorize error:', err.message);
    res.status(500).json({ error: 'Failed to categorize email' });
  }
});

// Auto-generate a reply for an email
app.post('/api/emails/:id/reply-draft', requireAuth, async (req, res) => {
  const { subject, from, snippet } = req.body;

  if (!snippet) return res.status(400).json({ error: 'snippet is required' });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a professional, concise email reply to this message. 
Just the reply body — no subject line, no "Subject:" prefix.

From: ${from}
Subject: ${subject}
Message: ${snippet}

Reply:`
      }]
    });

    res.json({ draft: response.content[0].text.trim() });
  } catch (err) {
    console.error('Draft reply error:', err.message);
    res.status(500).json({ error: 'Failed to generate reply draft' });
  }
});

// Send a reply
app.post('/api/emails/:id/send-reply', requireAuth, async (req, res) => {
  const { to, subject, body, threadId } = req.body;

  if (!to || !body) return res.status(400).json({ error: 'to and body are required' });

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(req.session.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const replySubject = subject?.startsWith('Re:') ? subject : `Re: ${subject}`;
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${replySubject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body,
    ].join('\n');

    const encoded = Buffer.from(rawMessage).toString('base64url');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encoded,
        ...(threadId ? { threadId } : {}),
      },
    });

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    console.error('Send reply error:', err.message);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// ── Error handlers ───────────────────────────────────────────────────────────

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ MailBot backend running → http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});