from django.db import models
from portfolio.models import Position
from user_auth.models import User

# Create your models here.


class Portfolio(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='portfolios')
    positions = models.ManyToManyField(Position, related_name='portfolios')

    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.serialize(),
            'positions': [position.serialize() for position in self.positions.all()]
        }
