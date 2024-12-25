from os import read
from rest_framework import serializers
from .models import DummyPosition, Position, Transaction
from follow.serializer import StockSerializer


class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('id', 'quantity', 'average_price', 'timestamp')


class PositionSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    transactions = TransactionSerializer(many=True)

    class Meta:
        model = Position
        fields = '__all__'


class DummyPositionSerializer(serializers.ModelSerializer):

    stock = StockSerializer(read_only=True)

    class Meta:
        model = DummyPosition
        fields = '__all__'
