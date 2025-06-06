# Generated by Django 5.1.4 on 2025-01-09 13:40

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(max_length=10)),
                ('name', models.CharField(max_length=100)),
                ('price', models.FloatField()),
                ('changesPercentage', models.FloatField()),
                ('change', models.FloatField()),
                ('dayLow', models.FloatField()),
                ('dayHigh', models.FloatField()),
                ('yearHigh', models.FloatField()),
                ('yearLow', models.FloatField()),
                ('marketCap', models.FloatField()),
                ('priceAvg50', models.FloatField()),
                ('priceAvg200', models.FloatField()),
                ('volume', models.IntegerField()),
                ('avgVolume', models.IntegerField()),
                ('exchange', models.CharField(max_length=10)),
                ('open', models.FloatField()),
                ('previousClose', models.FloatField()),
                ('eps', models.FloatField()),
                ('pe', models.FloatField(null=True)),
                ('earningsAnnouncement', models.CharField(max_length=100, null=True)),
                ('sharesOutstanding', models.IntegerField()),
                ('timestamp', models.IntegerField()),
            ],
        ),
    ]
