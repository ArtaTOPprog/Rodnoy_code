import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rodnoycode.settings')

app = Celery('rodnoycode')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()