# Generated by Django 5.0.7 on 2024-08-05 14:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='position',
            old_name='Stock',
            new_name='stock',
        ),
    ]
