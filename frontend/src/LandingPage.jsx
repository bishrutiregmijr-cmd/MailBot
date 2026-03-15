import { useState, useEffect, useRef } from 'react';
import { API } from './App';

function Orb({ x, y, size, color1, color2, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 40% 40%, ${color1}, ${color2}, transparent 70%)`,
      filter: 'blur(70px)', opacity: 0.4,
      animation: `orbFloat ${7 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`, pointerEvents: 'none',
    }} />
  );
}

function TiltCard({ children, style, glowColor = '#a855f7' }) {
  const ref = useRef();
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    ref.current.style.boxShadow = `${-x * 24}px ${-y * 24}px 50px ${glowColor}22`;
  };
  const reset = () => {
    ref.current.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1)';
    ref.current.style.boxShadow = 'none';
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={reset}
      style={{ transition: 'transform 0.18s ease, box-shadow 0.18s ease', ...style }}>
      {children}
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 10 + 6, delay: Math.random() * 6,
    color: ['#a855f7','#22d3ee','#e8c84a','#22c55e','#4285F4','#f97316'][Math.floor(Math.random() * 6)],
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.color, opacity: 0.5,
          animation: `particleFloat ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: '📄', label: 'Core Feature',       tag: '#22d3ee', title: 'PDF Knowledge Base',    desc: 'Upload any number of PDFs — manuals, FAQs, pricing. The AI reads and remembers everything, replying accurately every time.' },
  { icon: '↪',  label: 'Reliability',        tag: '#a855f7', title: 'Smart Forwarding',      desc: 'Emails outside the knowledge base are instantly forwarded to your team — nothing falls through the cracks.' },
  { icon: '🤖', label: 'AI-Powered',         tag: '#f97316', title: 'ML Spam Protection',    desc: 'Built-in machine learning spam detector plus OTP filter. MailBot never wastes a reply on automated, promotional, or spam emails.' },
  { icon: '🛡', label: 'Enterprise Security',tag: '#22c55e', title: 'Per-Account Isolation', desc: 'Every client\'s data, PDFs, and Gmail connection are fully isolated. Enterprise-grade security from day one.' },
  { icon: '⚡', label: 'Professional',       tag: '#e8c84a', title: 'Rich HTML Replies',      desc: 'Replies are formatted professionally in HTML — not plain text. Your customers get polished, branded responses.' },
  { icon: '✓',  label: 'Compliance',         tag: '#4285F4', title: 'Full Audit Trail',       desc: 'Every email sent, forwarded, or ignored is logged with timestamp, action, and reason. Full compliance ready.' },
];

export default function LandingPage({ onLogin }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeFeature, setActiveFeature] = useState(2);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signin');
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Enter your email.'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'signup') {
        const r = await fetch(`${API}/api/clients/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Signup failed');
        onLogin({ ...data, email: email.trim(), is_approved: false, bot_active: false });
      } else {
        const r = await fetch(`${API}/api/clients/`);
        const clients = await r.json();
        const found = clients.find(c => c.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) { setError('Account not found. Try signing up.'); setLoading(false); return; }
        onLogin(found);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const steps = [
    { num: '01', icon: '👤', color: '#4285F4', bg: 'linear-gradient(135deg,#4285F4,#6fa8ff)', tag: 'Takes 2 minutes.', title: 'Create your account', desc: 'Sign up with your business email. No credit card required.' },
    { num: '02', icon: '🛡', color: '#a855f7', bg: 'linear-gradient(135deg,#a855f7,#7c3aed)', tag: 'Enterprise accounts get priority review.', title: 'Account review & approval', desc: "Our team reviews your account for compliance. You'll be notified once approved — typically within hours." },
    { num: '03', icon: '⬆', color: '#22c55e', bg: 'linear-gradient(135deg,#22c55e,#16a34a)', tag: 'Supports multiple PDFs.', title: 'Upload your knowledge base', desc: 'Upload company PDFs — product manuals, FAQs, policies. MailBot extracts and indexes everything.' },
    { num: '04', icon: '✓', color: '#f97316', bg: 'linear-gradient(135deg,#f97316,#ea580c)', tag: 'Replies from your Gmail address.', title: 'Connect Gmail & go live', desc: 'One-click Google OAuth. Your bot starts monitoring and replying immediately.' },
  ];

  const plans = [
    { name: 'Starter', popular: false, enterprise: false, price: '8,999', desc: 'Perfect for small businesses.', features: ['1 Gmail account', 'Up to 3 PDF documents', '500 emails / month', 'Smart forwarding', 'Email audit log', 'Email support'] },
    { name: 'Professional', popular: true, enterprise: false, price: '20,999', desc: 'For growing businesses that need power and reliability.', features: ['5 Gmail accounts', 'Up to 12 PDF documents', '5,000 emails / month', 'Smart forwarding', 'Full audit trail', 'Priority support', 'Custom forwarding rules'] },
    { name: 'Enterprise', popular: false, enterprise: true, price: 'Custom', desc: 'For large organizations with compliance needs.', features: ['Unlimited Gmail accounts', 'Unlimited everything', '99.9% uptime SLA', 'Dedicated infrastructure', 'Custom integrations', '24/7 dedicated support', 'Compliance documentation'] },
  ];

  const inp = { width: '100%', padding: '0.75rem 1rem', background: '#0e0e1c', border: '1px solid #2a2a3a', borderRadius: '10px', color: '#f0ede8', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', color: '#f0ede8', fontFamily: "'DM Sans',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        @keyframes orbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-35px) scale(1.06)}}
        @keyframes particleFloat{0%,100%{transform:translateY(0) translateX(0);opacity:.3}33%{transform:translateY(-25px) translateX(12px);opacity:.9}66%{transform:translateY(-12px) translateX(-10px);opacity:.5}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}
        @keyframes gridDrift{from{transform:translateY(0)}to{transform:translateY(80px)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,.5)}50%{box-shadow:0 0 0 18px rgba(168,85,247,0)}}
        @keyframes borderGlow{0%,100%{border-color:rgba(168,85,247,.3)}50%{border-color:rgba(34,211,238,.5)}}
        @keyframes float3d{0%,100%{transform:perspective(1000px) rotateX(8deg) translateY(0)}50%{transform:perspective(1000px) rotateX(6deg) translateY(-12px)}}
        @keyframes scanline{0%{top:-100%}100%{top:200%}}
        .btn-primary{padding:1rem 2.5rem;border-radius:14px;background:linear-gradient(135deg,#a855f7,#22d3ee);color:#fff;font-weight:800;font-size:1rem;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;animation:pulse 2.5s ease-in-out infinite;font-family:inherit;letter-spacing:-.01em}
        .btn-primary:hover{transform:translateY(-4px) scale(1.04);box-shadow:0 16px 50px rgba(168,85,247,.55);animation:none}
        .btn-secondary{padding:1rem 2rem;border-radius:14px;background:rgba(255,255,255,.04);backdrop-filter:blur(12px);color:#aaa;font-weight:600;font-size:1rem;border:1px solid rgba(255,255,255,.1);cursor:pointer;transition:all .2s;font-family:inherit}
        .btn-secondary:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.22);color:#fff;transform:translateY(-3px)}
        .nav-glass{background:rgba(6,6,14,.75);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.05)}
        .feature-chip{padding:3px 10px;border-radius:100px;font-size:.7rem;font-weight:700;letter-spacing:.04em}
        .feat-card{background:rgba(12,12,24,.8);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:1.5rem;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
        .feat-card:hover{border-color:rgba(168,85,247,.35);background:rgba(18,18,36,.9)}
        .feat-card.active{border-color:rgba(168,85,247,.5);background:rgba(20,10,40,.9);box-shadow:0 0 40px rgba(168,85,247,.12)}
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav-glass" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.1rem 3rem', position:'sticky', top:0, zIndex:50, animation:'fadeDown .6s ease both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#e8c84a"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs>
            <rect width="32" height="32" rx="10" fill="url(#lg)"/>
            <path d="M7 12l9-5 9 5-9 5-9-5z" fill="#0a0a0f"/>
            <path d="M7 12v8l9 5V17L7 12z" fill="#2a2000" opacity=".6"/>
            <path d="M25 12v8l-9 5V17l9-5z" fill="#0a0a0f" opacity=".3"/>
          </svg>
          <span style={{ fontWeight:800, fontSize:'1.2rem', letterSpacing:'-.03em', background:'linear-gradient(90deg,#f0ede8,#888)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MailBot</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <button onClick={()=>{setShowSignIn(true);setMode('signin');}} className="btn-secondary" style={{ padding:'.5rem 1.3rem', fontSize:'.88rem' }}>Sign In</button>
          <button onClick={()=>{setShowSignIn(true);setMode('signup');}} className="btn-primary" style={{ padding:'.5rem 1.5rem', fontSize:'.88rem', animation:'none' }}>Get Started →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:'relative', maxWidth:'980px', margin:'0 auto', padding:'7rem 2rem 4rem', textAlign:'center', overflow:'visible' }}>
        <div style={{ position:'absolute', inset:'-300px', pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
          <Orb x="-15%" y="-5%"  size="700px" color1="#a855f799" color2="#7c3aed44" delay={0}/>
          <Orb x="55%"  y="-15%" size="600px" color1="#22d3ee66" color2="#0ea5e933" delay={2.5}/>
          <Orb x="15%"  y="55%"  size="450px" color1="#e8c84a33" color2="#f9731622" delay={4.5}/>
        </div>
        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(168,85,247,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.05) 1px,transparent 1px)', backgroundSize:'64px 64px', animation:'gridDrift 10s linear infinite', zIndex:0, pointerEvents:'none', maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)' }}/>
        <Particles/>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Badge */}
          <div style={{ opacity:visible?1:0, animation:visible?'fadeUp .7s ease .1s both':'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'2rem', padding:'.45rem 1.1rem', borderRadius:'100px', border:'1px solid rgba(168,85,247,.35)', background:'rgba(168,85,247,.08)', color:'#c084fc', fontSize:'.8rem', letterSpacing:'.06em', backdropFilter:'blur(12px)', animation:'borderGlow 3s ease-in-out infinite' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px #22c55e', display:'inline-block' }}/>
              ⚡ AI-Powered Gmail Automation
            </div>
          </div>

          {/* Headline */}
          <div style={{ opacity:visible?1:0, animation:visible?'fadeUp .8s ease .22s both':'none' }}>
            <h1 style={{ fontSize:'clamp(3.2rem,9vw,6.5rem)', fontWeight:900, lineHeight:.98, letterSpacing:'-.055em', marginBottom:'1.5rem' }}>
              Your Gmail replies<br/>
              <span style={{ background:'linear-gradient(90deg,#a855f7,#22d3ee,#a855f7)', backgroundSize:'250% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 3.5s linear infinite' }}>
                itself. Automatically.
              </span>
            </h1>
          </div>

          <div style={{ opacity:visible?1:0, animation:visible?'fadeUp .8s ease .38s both':'none' }}>
            <p style={{ fontSize:'1.15rem', color:'#5a5a7a', lineHeight:1.8, maxWidth:'580px', margin:'0 auto 3rem' }}>
              Upload your company PDFs. Connect your Gmail. Watch the AI reply to every customer email — 24/7, from your own knowledge base.
            </p>
          </div>

          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', opacity:visible?1:0, animation:visible?'fadeUp .8s ease .52s both':'none' }}>
            <button onClick={()=>{setShowSignIn(true);setMode('signup');}} className="btn-primary">Create Free Account →</button>
            <button onClick={()=>{setShowSignIn(true);setMode('signin');}} className="btn-secondary">Sign In</button>
          </div>

          {/* 3D Email card */}
          <div style={{ marginTop:'4.5rem', opacity:visible?1:0, animation:visible?'fadeUp 1s ease .7s both':'none' }}>
            <div style={{ display:'inline-block', perspective:'1200px' }}>
              <div style={{ background:'rgba(12,12,28,.85)', backdropFilter:'blur(24px)', border:'1px solid rgba(168,85,247,.25)', borderRadius:'22px', padding:'1.75rem 2rem', maxWidth:'540px', textAlign:'left', animation:'float3d 5s ease-in-out infinite', boxShadow:'0 50px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.1), 0 0 80px rgba(168,85,247,.1)', position:'relative', overflow:'hidden' }}>
                {/* scanline */}
                <div style={{ position:'absolute', left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,rgba(168,85,247,.3),transparent)', animation:'scanline 4s linear infinite', pointerEvents:'none' }}/>
                <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'1.1rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ width:11, height:11, borderRadius:'50%', background:'#ff5f57' }}/>
                  <div style={{ width:11, height:11, borderRadius:'50%', background:'#ffbd2e' }}/>
                  <div style={{ width:11, height:11, borderRadius:'50%', background:'#28ca41' }}/>
                  <span style={{ marginLeft:'10px', color:'#333', fontSize:'.75rem', letterSpacing:'.04em' }}>INCOMING EMAIL</span>
                </div>
                <div style={{ fontSize:'.75rem', color:'#444', marginBottom:'.4rem' }}>From: customer@business.com · 2m ago</div>
                <div style={{ fontSize:'.95rem', fontWeight:700, color:'#ccc', marginBottom:'.4rem' }}>What's your pricing for 50 users?</div>
                <div style={{ fontSize:'.82rem', color:'#444', marginBottom:'1rem' }}>Hi, we're evaluating solutions for our team...</div>
                <div style={{ height:'1px', background:'rgba(255,255,255,.04)', marginBottom:'1rem' }}/>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#a855f7,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', color:'#fff', fontWeight:800, flexShrink:0 }}>AI</div>
                  <div>
                    <div style={{ fontSize:'.75rem', color:'#a855f7', fontWeight:700 }}>MailBot replied automatically</div>
                    <div style={{ fontSize:'.75rem', color:'#444' }}>Based on pricing.pdf · 0.28s response</div>
                  </div>
                  <span style={{ marginLeft:'auto', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.3)', color:'#4ade80', padding:'3px 10px', borderRadius:'100px', fontSize:'.7rem', fontWeight:600, flexShrink:0 }}>✓ Sent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ maxWidth:'1020px', margin:'2rem auto 7rem', padding:'0 2rem', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))', gap:'1.1rem' }}>
        {[
          { icon:'🕐', color:'#f97316', value:'24/7',   label:'Always Available' },
          { icon:'⚡', color:'#a855f7', value:'< 2min', label:'Avg Reply Time' },
          { icon:'🛡', color:'#22c55e', value:'Zero',   label:'Hallucinations' },
          { icon:'📄', color:'#4285F4', value:'100%',   label:'PDF-Grounded Replies' },
        ].map((s,i) => (
          <TiltCard key={s.label} glowColor={s.color} style={{ animation:`fadeUp .6s ease ${.1*i}s both` }}>
            <div style={{ background:'rgba(255,255,255,.025)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'20px', padding:'2rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${s.color},transparent)` }}/>
              <div style={{ fontSize:'1.8rem', marginBottom:'.6rem', filter:`drop-shadow(0 0 10px ${s.color})` }}>{s.icon}</div>
              <div style={{ fontSize:'2.1rem', fontWeight:800, letterSpacing:'-.03em', marginBottom:'.3rem', background:`linear-gradient(135deg,${s.color},#fff)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.value}</div>
              <div style={{ fontSize:'.8rem', color:'#4a4a6a' }}>{s.label}</div>
            </div>
          </TiltCard>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:'1100px', margin:'0 auto 8rem', padding:'0 2rem', textAlign:'center' }}>
        <div style={{ display:'inline-block', padding:'.3rem .9rem', borderRadius:'100px', border:'1px solid #2a2a3a', color:'#666', fontSize:'.78rem', letterSpacing:'.1em', marginBottom:'1.5rem' }}>FEATURES</div>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:800, letterSpacing:'-.04em', marginBottom:'.75rem' }}>
          Built for <span style={{ background:'linear-gradient(90deg,#a855f7,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>real businesses</span>
        </h2>
        <p style={{ color:'#4a4a6a', marginBottom:'3rem', fontSize:'.95rem', maxWidth:'540px', margin:'0 auto 3rem', lineHeight:1.7 }}>
          Every feature is designed around one goal: make your email support effortless and professional.
        </p>

        {/* Feature grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {FEATURES.map((f,i) => (
            <TiltCard key={i} glowColor={f.tag}>
              <div className={`feat-card ${activeFeature===i?'active':''}`} onClick={()=>setActiveFeature(i)}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'.75rem' }}>
                  <div style={{ width:36, height:36, borderRadius:'10px', background:`${f.tag}18`, border:`1px solid ${f.tag}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>{f.icon}</div>
                  <span style={{ fontWeight:700, fontSize:'.92rem' }}>{f.title}</span>
                </div>
                <span className="feature-chip" style={{ background:`${f.tag}18`, border:`1px solid ${f.tag}44`, color:f.tag }}>{f.label}</span>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Active feature detail */}
        <div style={{ background:'linear-gradient(135deg,rgba(168,85,247,.08),rgba(34,211,238,.04))', border:`1px solid ${FEATURES[activeFeature].tag}44`, borderRadius:'20px', padding:'2rem 2.5rem', textAlign:'left', display:'flex', alignItems:'center', gap:'2rem', transition:'all .3s', backdropFilter:'blur(16px)' }}>
          <div style={{ width:72, height:72, borderRadius:'18px', background:`${FEATURES[activeFeature].tag}18`, border:`1px solid ${FEATURES[activeFeature].tag}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0, boxShadow:`0 12px 40px ${FEATURES[activeFeature].tag}33` }}>
            {FEATURES[activeFeature].icon}
          </div>
          <div>
            <span className="feature-chip" style={{ background:`${FEATURES[activeFeature].tag}18`, border:`1px solid ${FEATURES[activeFeature].tag}44`, color:FEATURES[activeFeature].tag, marginBottom:'.75rem', display:'inline-block' }}>{FEATURES[activeFeature].label}</span>
            <div style={{ fontWeight:800, fontSize:'1.3rem', marginBottom:'.5rem' }}>{FEATURES[activeFeature].title}</div>
            <div style={{ color:'#5a5a7a', fontSize:'.9rem', lineHeight:1.7 }}>{FEATURES[activeFeature].desc}</div>
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section style={{ maxWidth:'860px', margin:'0 auto 8rem', padding:'0 2rem', textAlign:'center' }}>
        <div style={{ display:'inline-block', padding:'.3rem .9rem', borderRadius:'100px', border:'1px solid #2a2a3a', color:'#666', fontSize:'.78rem', letterSpacing:'.1em', marginBottom:'1.5rem' }}>PROCESS</div>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:800, letterSpacing:'-.04em', marginBottom:'.75rem' }}>
          Live in <span style={{ background:'linear-gradient(90deg,#a855f7,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>4 simple steps</span>
        </h2>
        <p style={{ color:'#4a4a6a', marginBottom:'3.5rem', fontSize:'.95rem' }}>Set up once. Runs forever.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', position:'relative' }}>
          <div style={{ position:'absolute', left:'29px', top:'65px', bottom:'65px', width:'2px', background:'linear-gradient(to bottom,#a855f7,#22d3ee)', opacity:.25 }}/>
          {steps.map((s,i) => (
            <TiltCard key={i} glowColor={s.color} style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', textAlign:'left' }}>
              <div style={{ width:60, height:60, borderRadius:'16px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, boxShadow:`0 12px 35px ${s.color}55` }}>{s.icon}</div>
              <div style={{ flex:1, background:'rgba(12,12,26,.8)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'14px', padding:'1.25rem 1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'.7rem', fontWeight:700, color:'#3a3a5a', letterSpacing:'.1em' }}>STEP {s.num}</span>
                  <span style={{ padding:'2px 10px', borderRadius:'100px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', color:'#4a4a6a', fontSize:'.72rem' }}>{s.tag}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:'.4rem' }}>{s.title}</div>
                <div style={{ color:'#4a4a6a', fontSize:'.88rem', lineHeight:1.65 }}>{s.desc}</div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ maxWidth:'1100px', margin:'0 auto 8rem', padding:'0 2rem', textAlign:'center' }}>
        <div style={{ display:'inline-block', padding:'.3rem .9rem', borderRadius:'100px', border:'1px solid #2a2a3a', color:'#666', fontSize:'.78rem', letterSpacing:'.1em', marginBottom:'1.5rem' }}>PRICING</div>
        <h2 style={{ fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:800, letterSpacing:'-.04em', marginBottom:'.75rem' }}>
          Simple, <span style={{ background:'linear-gradient(90deg,#a855f7,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>transparent pricing</span>
        </h2>
        <p style={{ color:'#4a4a6a', marginBottom:'3rem', fontSize:'.95rem' }}>No hidden fees. Cancel anytime.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:'1.5rem', alignItems:'start' }}>
          {plans.map(plan => (
            <TiltCard key={plan.name} glowColor={plan.popular?'#a855f7':'#333'}>
              <div style={{ background:plan.popular?'linear-gradient(135deg,rgba(168,85,247,.14),rgba(34,211,238,.07))':'rgba(10,10,20,.85)', backdropFilter:'blur(20px)', border:`1px solid ${plan.popular?'rgba(168,85,247,.45)':'rgba(255,255,255,.06)'}`, borderRadius:'22px', padding:'2.25rem', textAlign:'left', position:'relative', boxShadow:plan.popular?'0 0 70px rgba(168,85,247,.18), inset 0 1px 0 rgba(255,255,255,.09)':'inset 0 1px 0 rgba(255,255,255,.04)' }}>
                {plan.popular && <>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#a855f7,#22d3ee,transparent)', borderRadius:'22px 22px 0 0' }}/>
                  <div style={{ position:'absolute', top:'-16px', left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#a855f7,#22d3ee)', color:'#fff', padding:'4px 20px', borderRadius:'100px', fontSize:'.75rem', fontWeight:800, whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(168,85,247,.55)' }}>✦ Most Popular</div>
                </>}
                {plan.enterprise && <div style={{ position:'absolute', top:'-16px', right:'1.5rem', background:'#12121a', border:'1px solid #2a2a3a', color:'#666', padding:'4px 14px', borderRadius:'100px', fontSize:'.75rem', fontWeight:600 }}>Enterprise</div>}
                <div style={{ fontWeight:800, fontSize:'1.2rem', marginBottom:'.4rem' }}>{plan.name}</div>
                <div style={{ color:'#4a4a6a', fontSize:'.83rem', marginBottom:'1.5rem', lineHeight:1.5 }}>{plan.desc}</div>
                <div style={{ marginBottom:'1.75rem' }}>
                  {plan.price==='Custom'
                    ? <span style={{ fontSize:'2.8rem', fontWeight:800, letterSpacing:'-.03em' }}>Custom</span>
                    : <><span style={{ color:'#4a4a6a', fontSize:'.9rem' }}>Rs. </span><span style={{ fontSize:'2.8rem', fontWeight:800, letterSpacing:'-.04em' }}>{plan.price}</span><span style={{ color:'#4a4a6a', fontSize:'.85rem' }}> / month</span></>}
                </div>
                <button onClick={()=>{setShowSignIn(true);setMode('signup');}}
                  style={{ width:'100%', padding:'.85rem', borderRadius:'12px', marginBottom:'1.5rem', background:plan.popular?'linear-gradient(135deg,#a855f7,#22d3ee)':'rgba(255,255,255,.05)', border:plan.popular?'none':'1px solid rgba(255,255,255,.08)', color:plan.popular?'#fff':'#777', fontWeight:700, fontSize:'.9rem', cursor:'pointer', transition:'opacity .2s', boxShadow:plan.popular?'0 4px 24px rgba(168,85,247,.45)':'none', fontFamily:'inherit' }}
                  onMouseOver={e=>e.currentTarget.style.opacity='.85'}
                  onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                  {plan.price==='Custom'?'Contact Sales':'Get Started'}
                </button>
                <div style={{ display:'flex', flexDirection:'column', gap:'.65rem' }}>
                  {plan.features.map(f=>(
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'.85rem', color:'#666' }}>
                      <span style={{ color:'#22c55e', flexShrink:0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth:'920px', margin:'0 auto 7rem', padding:'0 2rem' }}>
        <div style={{ position:'relative', borderRadius:'30px', padding:'5.5rem 3rem', textAlign:'center', overflow:'hidden', background:'linear-gradient(135deg,rgba(15,6,35,.97),rgba(6,15,32,.97))', border:'1px solid rgba(168,85,247,.25)', boxShadow:'0 50px 120px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.07), 0 0 120px rgba(168,85,247,.08)' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'500px', background:'radial-gradient(ellipse,rgba(168,85,247,.14),transparent 65%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:'15%', right:'8%', width:'250px', height:'250px', background:'radial-gradient(circle,rgba(34,211,238,.09),transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:'15%', left:'8%', width:'200px', height:'200px', background:'radial-gradient(circle,rgba(232,200,74,.07),transparent 70%)', pointerEvents:'none' }}/>
          <Particles/>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'2rem', padding:'.4rem 1rem', borderRadius:'100px', border:'1px solid rgba(34,197,94,.3)', background:'rgba(34,197,94,.07)', color:'#4ade80', fontSize:'.8rem' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px #22c55e', display:'inline-block' }}/>
              Start automating your email support today
            </div>
            <h2 style={{ fontSize:'clamp(2.2rem,6vw,3.8rem)', fontWeight:800, letterSpacing:'-.05em', marginBottom:'1rem', lineHeight:1.0 }}>
              Ready to automate<br/>
              <span style={{ background:'linear-gradient(90deg,#a855f7,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>your email support?</span>
            </h2>
            <p style={{ color:'#4a4a6a', fontSize:'1rem', lineHeight:1.75, maxWidth:'500px', margin:'0 auto 3rem' }}>
              Set up once. MailBot handles customer emails 24/7 — professionally, accurately, and instantly from your own knowledge base.
            </p>
            <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>{setShowSignIn(true);setMode('signup');}} className="btn-primary">Create Free Account →</button>
              <button className="btn-secondary" style={{ display:'flex', alignItems:'center', gap:'8px' }}>✉ Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ textAlign:'center', padding:'2.5rem', borderTop:'1px solid rgba(255,255,255,.04)', color:'#252535', fontSize:'.83rem' }}>
        © 2026 MailBot — AI-Powered Gmail Automation
      </footer>

      {/* ── AUTH MODAL ── */}
      {showSignIn && (
        <div onClick={e=>{if(e.target===e.currentTarget)setShowSignIn(false);}}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, backdropFilter:'blur(20px)', animation:'scaleIn .25s ease' }}>
          <div style={{ background:'rgba(10,10,22,.97)', border:'1px solid rgba(168,85,247,.3)', borderRadius:'24px', padding:'2.5rem', width:'100%', maxWidth:'420px', margin:'1rem', boxShadow:'0 50px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.08), 0 0 80px rgba(168,85,247,.15)', backdropFilter:'blur(24px)', animation:'fadeUp .3s ease', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#a855f7,#22d3ee,transparent)' }}/>
            <h2 style={{ fontWeight:800, fontSize:'1.5rem', marginBottom:'.4rem', letterSpacing:'-.03em' }}>
              {mode==='signin'?'Welcome back 👋':'Get started free ✨'}
            </h2>
            <p style={{ color:'#4a4a6a', fontSize:'.85rem', marginBottom:'1.75rem' }}>
              {mode==='signin'?'Sign in to continue to your dashboard.':'Create your account in seconds.'}
            </p>
            <label style={{ display:'block', fontSize:'.74rem', color:'#4a4a6a', fontWeight:700, marginBottom:'.45rem', textTransform:'uppercase', letterSpacing:'.08em' }}>Email Address</label>
            <input style={inp} type="email" placeholder="you@company.com" value={email}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
              onFocus={e=>e.target.style.borderColor='rgba(168,85,247,.55)'}
              onBlur={e=>e.target.style.borderColor='#2a2a3a'} autoFocus/>
            {error && <div style={{ color:'#ff6b6b', fontSize:'.82rem', marginTop:'.6rem', padding:'.5rem .75rem', background:'rgba(255,75,75,.08)', borderRadius:'8px', border:'1px solid rgba(255,75,75,.2)' }}>{error}</div>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:'100%', marginTop:'1.25rem', padding:'.85rem', borderRadius:'12px', background:'linear-gradient(135deg,#a855f7,#22d3ee)', color:'#fff', fontWeight:800, fontSize:'.95rem', border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?.7:1, boxShadow:'0 4px 24px rgba(168,85,247,.45)', fontFamily:'inherit', transition:'opacity .2s' }}>
              {loading?'Please wait...':mode==='signin'?'Sign In →':'Create Account →'}
            </button>
            <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'.83rem', color:'#3a3a5a' }}>
              {mode==='signin'
                ?<>No account? <button onClick={()=>{setMode('signup');setError('');}} style={{ background:'none', border:'none', color:'#a855f7', cursor:'pointer', fontSize:'.83rem', fontWeight:700 }}>Sign up free</button></>
                :<>Already have one? <button onClick={()=>{setMode('signin');setError('');}} style={{ background:'none', border:'none', color:'#a855f7', cursor:'pointer', fontSize:'.83rem', fontWeight:700 }}>Sign in</button></>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}