from django.db import models
from follow.models import Stock


class Position(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.FloatField(null=False)
    average_price = models.FloatField(null=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.stock.name
