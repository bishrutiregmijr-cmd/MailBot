from django.db import models


class Client(models.Model):
    full_name    = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    email        = models.EmailField(unique=True)
    is_approved  = models.BooleanField(default=False)
    bot_active   = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name or self.full_name or 'Unnamed'} ({self.email})"

    class Meta:
        ordering = ["-created_at"]


class ClientPDF(models.Model):
    client      = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="pdfs")
    title       = models.CharField(max_length=255)
    file        = models.FileField(upload_to="client_pdfs/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.company_name or self.client.email} — {self.title}"


class GmailAccount(models.Model):
    client        = models.OneToOneField(Client, on_delete=models.CASCADE, related_name="gmail_account")
    email         = models.EmailField(unique=True)
    token_json    = models.TextField(blank=True)
    is_authorized = models.BooleanField(default=False)
    connected_at  = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "✓" if self.is_authorized else "✗"
        return f"{self.email} → {self.client} ({status})"


class ProcessedEmail(models.Model):
    ACTION_CHOICES = [
        ("replied",   "Replied"),
        ("forwarded", "Forwarded"),
        ("ignored",   "Ignored"),
        ("error",     "Error"),
    ]

    client     = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="processed_emails")
    gmail      = models.ForeignKey(GmailAccount, on_delete=models.SET_NULL, null=True, related_name="processed_emails")
    message_id = models.CharField(max_length=255, unique=True)
    sender     = models.EmailField()
    subject    = models.CharField(max_length=500, blank=True)
    action     = models.CharField(max_length=20, choices=ACTION_CHOICES)
    details    = models.TextField(blank=True)
    processed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action.upper()} — {self.subject[:50]} ({self.sender})"

    class Meta:
        ordering = ["-processed_at"]