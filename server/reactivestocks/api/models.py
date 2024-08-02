from django.db import models


class Stock(models.Model):
    symbol = models.CharField(null=True, max_length=10)
    open_price = models.FloatField(null=True)
    high = models.FloatField(null=True)
    low = models.FloatField(null=True)
    price = models.FloatField(null=True)
    volume = models.FloatField(null=True)
    latest_trading_day = models.DateField(null=True)
    previous_close = models.FloatField(null=True)
    change = models.FloatField(null=True)
    change_percent = models.FloatField(null=True)

    def __str__(self):
        return self.symbol
