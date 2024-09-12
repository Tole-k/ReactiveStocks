from django.db import models
from user_auth.models import User

# Create your models here.


class Portfolio(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='portfolios')

    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.serialize(),
            'positions': [position.serialize() for position in self.positions.all()]
        }
