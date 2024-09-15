from rest_framework import serializers
from .models import Position, Transaction
from follow.serializer import StockSerializer


class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('id', 'quantity', 'average_price', 'timestamp')


class PositionSerializer(serializers.ModelSerializer):
    stock = StockSerializer()
    transactions = TransactionSerializer(many=True)

    class Meta:
        model = Position
        fields = '__all__'
