from django.db import models
from follow.models import Stock
from piechart.models import Portfolio


class AbstractPosition(models.Model):
    stock = models.ForeignKey(
        Stock, on_delete=models.CASCADE, related_name='%(class)s')
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name='%(class)s')

    class Meta:
        abstract = True


class DummyPosition(AbstractPosition):
    allocation = models.FloatField()



class Position(AbstractPosition):

    quantity = models.FloatField(blank=True)
    average_price = models.FloatField(blank=True)

    def __str__(self):
        return self.stock.name

    def update(self):
        self.quantity = sum(
            [transaction.quantity for transaction in self.transactions.all()])
        self.average_price = sum(
            [max(transaction.quantity, 0) * transaction.average_price for transaction in self.transactions.all()]) / sum([max(transaction.quantity, 0) for transaction in self.transactions.all()])


class Transaction(models.Model):
    position = models.ForeignKey(
        Position, on_delete=models.CASCADE, related_name='transactions')
    quantity = models.FloatField()
    average_price = models.FloatField()
    timestamp = models.DateTimeField()
