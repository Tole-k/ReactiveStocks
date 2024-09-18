from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    def __str__(self):
        return self.username

    def serialize(self):
        return {
            'id': self.id,
            "username": self.username,
            "email": self.email,
            "stocks": [stock.serialize() for stock in self.stocks.all()],
            "portfolios": [portfolio.serialize() for portfolio in self.portfolios.all()],
        }
