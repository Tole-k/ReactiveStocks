from django.db import models
from user_auth.models import User


class Stock(models.Model):
    users = models.ManyToManyField(User, related_name='stocks')
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
    pe = models.FloatField()
    earningsAnnouncement = models.CharField(null=True, max_length=100)
    sharesOutstanding = models.IntegerField()
    timestamp = models.IntegerField()

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "symbol": self.symbol,
            "name": self.name,
            "price": self.price,
            "changesPercentage": self.changesPercentage,
            "change": self.change,
            "dayLow": self.dayLow,
            "dayHigh": self.dayHigh,
            "yearHigh": self.yearHigh,
            "yearLow": self.yearLow,
            "marketCap": self.marketCap,
            "priceAvg50": self.priceAvg50,
            "priceAvg200": self.priceAvg200,
            "volume": self.volume,
            "avgVolume": self.avgVolume,
            "exchange": self.exchange,
            "open": self.open,
            "previousClose": self.previousClose,
            "eps": self.eps,
            "pe": self.pe,
            "earningsAnnouncement": self.earningsAnnouncement,
            "sharesOutstanding": self.sharesOutstanding,
            "timestamp": self.timestamp,
        }
