# Generated by Django 5.1.1 on 2024-09-10 16:54

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('follow', '0005_alter_stock_users'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='users',
            field=models.ManyToManyField(blank=True, related_name='stocks', to=settings.AUTH_USER_MODEL),
        ),
    ]
