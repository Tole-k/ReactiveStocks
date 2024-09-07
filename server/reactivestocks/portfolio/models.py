from django.db import models
from follow.models import Stock
from user_auth.models import User


class Position(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='positions')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='positions')
    quantity = models.FloatField()
    average_price = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.stock.name

    def serialize(self):
        return {
            "stock": self.stock.serialize(),
            "quantity": self.quantity,
            "average_price": self.average_price,
            "timestamp": self.timestamp
        }
