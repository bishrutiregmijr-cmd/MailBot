from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Client, ClientPDF, GmailAccount, ProcessedEmail


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display  = ("company_name", "email", "is_approved", "bot_active", "created_at")
    list_filter   = ("is_approved", "bot_active")
    search_fields = ("company_name", "email")


@admin.register(ClientPDF)
class ClientPDFAdmin(admin.ModelAdmin):
    list_display  = ("title", "client", "uploaded_at")
    list_filter   = ("client",)
    search_fields = ("title",)


@admin.register(GmailAccount)
class GmailAccountAdmin(admin.ModelAdmin):
    list_display  = ("email", "client", "is_authorized", "connected_at")
    list_filter   = ("is_authorized",)
    search_fields = ("email",)


@admin.register(ProcessedEmail)
class ProcessedEmailAdmin(admin.ModelAdmin):
    list_display  = ("subject", "sender", "action", "client", "processed_at")
    list_filter   = ("action", "client")
    search_fields = ("subject", "sender")