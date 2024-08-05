from django.db import models


class Stock(models.Model):
    symbol = models.CharField(null=False, max_length=10)
    name = models.CharField(null=False, max_length=100)
    price = models.FloatField(null=False)
    changesPercentage = models.FloatField(null=False)
    change = models.FloatField(null=False)
    dayLow = models.FloatField(null=False)
    dayHigh = models.FloatField(null=False)
    yearHigh = models.FloatField(null=False)
    yearLow = models.FloatField(null=False)
    marketCap = models.FloatField(null=False)
    priceAvg50 = models.FloatField(null=False)
    priceAvg200 = models.FloatField(null=False)
    volume = models.IntegerField(null=False)
    avgVolume = models.IntegerField(null=False)
    exchange = models.CharField(null=False, max_length=10)
    open = models.FloatField(null=False)
    previousClose = models.FloatField(null=False)
    eps = models.FloatField(null=False)
    pe = models.FloatField(null=False)
    earningsAnnouncement = models.CharField(null=False, max_length=100)
    sharesOutstanding = models.IntegerField(null=False)
    timestamp = models.IntegerField(null=False)
    owned = models.BooleanField(null=False, default=False)
    followed = models.BooleanField(null=False, default=False)

    def __str__(self):
        return self.name
