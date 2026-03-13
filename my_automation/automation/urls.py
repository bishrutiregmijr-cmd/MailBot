from django.urls import path
from .views import gmail_trigger_view

urlpatterns = [
    path('gmail-trigger/', gmail_trigger_view, name='gmail-trigger'),
]