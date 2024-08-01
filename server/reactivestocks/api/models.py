from django.db import models


class Stock(models.Model):
    symbol = models.TextField(null=True)
    price = models.FloatField(null=True)
    change = models.FloatField(null=True)

    def __str__(self):
        return self.symbol
