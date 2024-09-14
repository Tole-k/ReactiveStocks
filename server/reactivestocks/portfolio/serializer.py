from rest_framework import serializers
from .models import Position, Transaction
from follow.serializer import StockSerializer


class PositionSerializer(serializers.ModelSerializer):
    stock = StockSerializer()

    class Meta:
        model = Position
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    position = PositionSerializer()

    class Meta:
        model = Transaction
        fields = '__all__'
