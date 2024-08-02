from django.db import models


class Stock(models.Model):
    symbol = models.CharField(null=True, max_length=10)
    name = models.CharField(null=True, max_length=100)
    price = models.FloatField(null=True)
    changesPercentage = models.FloatField(null=True)
    change = models.FloatField(null=True)
    dayLow = models.FloatField(null=True)
    dayHigh = models.FloatField(null=True)
    yearHigh = models.FloatField(null=True)
    yearLow = models.FloatField(null=True)
    marketCap = models.FloatField(null=True)
    priceAvg50 = models.FloatField(null=True)
    priceAvg200 = models.FloatField(null=True)
    volume = models.IntegerField(null=True)
    avgVolume = models.IntegerField(null=True)
    exchange = models.CharField(null=True, max_length=10)
    open = models.FloatField(null=True)
    previousClose = models.FloatField(null=True)
    eps = models.FloatField(null=True)
    pe = models.FloatField(null=True)
    earningsAnnouncement = models.CharField(null=True, max_length=100)
    sharesOutstanding = models.IntegerField(null=True)
    timestamp = models.IntegerField(null=True)
    
    # open_price = models.FloatField(null=True)
    # high = models.FloatField(null=True)
    # low = models.FloatField(null=True)
    # price = models.FloatField(null=True)
    # volume = models.FloatField(null=True)
    # latest_trading_day = models.DateField(null=True)
    # previous_close = models.FloatField(null=True)
    # change = models.FloatField(null=True)
    # change_percent = models.FloatField(null=True)

    def __str__(self):
        return self.symbol
