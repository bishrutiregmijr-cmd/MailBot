# Recommended for Railway + Django in 2025/2026: slim, secure, IPv6 support
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Install build deps for psycopg etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY my_automation/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static (run as part of build)
RUN python my_automation/manage.py collectstatic --noinput

EXPOSE $PORT

# Start: migrate at runtime (DB may not be ready during build) + gunicorn
CMD python my_automation/manage.py migrate --noinput && \
    gunicorn my_automation.wsgi:application \
    --bind [::]:$PORT \
    --workers 3 \
    --timeout 120
    