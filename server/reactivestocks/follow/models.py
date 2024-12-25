from django.db import models
from user_auth.models import User


class Stock(models.Model):
    users = models.ManyToManyField(User, blank=True, related_name='stocks')
    symbol = models.CharField(null=False, max_length=10)
    name = models.CharField(null=False, max_length=100)
    price = models.FloatField()
    changesPercentage = models.FloatField()
    change = models.FloatField()
    dayLow = models.FloatField()
    dayHigh = models.FloatField()
    yearHigh = models.FloatField()
    yearLow = models.FloatField()
    marketCap = models.FloatField()
    priceAvg50 = models.FloatField()
    priceAvg200 = models.FloatField()
    volume = models.IntegerField()
    avgVolume = models.IntegerField()
    exchange = models.CharField(max_length=10)
    open = models.FloatField()
    previousClose = models.FloatField()
    eps = models.FloatField()
    pe = models.FloatField(null=True)
    earningsAnnouncement = models.CharField(null=True, max_length=100)
    sharesOutstanding = models.IntegerField()
    timestamp = models.IntegerField()

    def __str__(self):
        return self.name
