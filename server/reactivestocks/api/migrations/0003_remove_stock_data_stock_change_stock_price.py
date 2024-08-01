# Generated by Django 5.0.7 on 2024-08-01 12:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_stock_delete_book'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stock',
            name='data',
        ),
        migrations.AddField(
            model_name='stock',
            name='change',
            field=models.FloatField(null=True),
        ),
        migrations.AddField(
            model_name='stock',
            name='price',
            field=models.FloatField(null=True),
        ),
    ]
