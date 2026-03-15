from django.urls import path
from .views import (
    # Original
    gmail_trigger_view, oauth_callback, get_logs, run_agent, get_stats,
    # New
    clients_view, approve_client,
    client_pdfs, delete_pdf,
    client_emails, client_knowledge_base,
)

urlpatterns = [
    # ── Original (unchanged) ──────────────────────────────────────────────────
    path('gmail-trigger/',  gmail_trigger_view, name='gmail-trigger'),
    path('oauth-callback/', oauth_callback,     name='oauth-callback'),
    path('api/logs/',       get_logs,           name='get-logs'),
    path('api/run-agent/',  run_agent,          name='run-agent'),
    path('api/stats/',      get_stats,          name='get-stats'),

    # ── Clients ───────────────────────────────────────────────────────────────
    path('api/clients/',                                    clients_view,          name='clients'),
    path('api/clients/<int:client_id>/approve/',            approve_client,        name='approve-client'),

    # ── PDFs ──────────────────────────────────────────────────────────────────
    path('api/clients/<int:client_id>/pdfs/',               client_pdfs,           name='client-pdfs'),
    path('api/clients/<int:client_id>/pdfs/<int:pdf_id>/',  delete_pdf,            name='delete-pdf'),

    # ── Emails & Knowledge ────────────────────────────────────────────────────
    path('api/clients/<int:client_id>/emails/',             client_emails,         name='client-emails'),
    path('api/clients/<int:client_id>/knowledge-base/',     client_knowledge_base, name='knowledge-base'),
]