from rest_framework import serializers
from .models import Position
from follow.serializer import StockSerializer


class PositionSerializer(serializers.ModelSerializer):
    stock = StockSerializer()

    class Meta:
        model = Position
        fields = '__all__'
