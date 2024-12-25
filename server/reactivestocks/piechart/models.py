from django.db import models
from user_auth.models import User


class Portfolio(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='portfolios')
