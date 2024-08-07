import time
from turtle import pos, st
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Position, Stock
from .serializer import PositionSerializer
from follow.serializer import StockSerializer
import requests
from follow.views import update

APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


@api_view(['GET'])
def get_positions(request):
    if not Position.objects.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)
    positions = Position.objects.all()
    stocks = [position.stock for position in positions]
    update(stocks)
    serializedData = PositionSerializer(positions, many=True).data
    return Response(serializedData)


@api_view(['POST'])
def open_position(request):
    data = request.data['positionData']
    symbol = data['symbol']
    stock = Stock.objects.get(symbol=symbol) if Stock.objects.filter(symbol=symbol).exists() else None
    if stock is None:
        stock_data = requests.get(
            f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()[0]
        stock_data['owned'] = True
        serializer = StockSerializer(data=stock_data)
        if serializer.is_valid():
            serializer.save()
            stock = Stock.objects.get(symbol=symbol)
            data['stock'] = stock
            position = Position(stock=data['stock'], quantity=float(data['quantity']), average_price=float(data['average_price']), timestamp=data['timestamp'])
            position.save()
            return Response(position, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        data['stock'] = stock
        position = Position.objects.filter(stock=stock).first()
        if position is not None:
            position.average_price = (position.average_price * position.quantity +
                                      float(data['average_price']) * float(data['quantity']))/(position.quantity + float(data['quantity']))
            position.quantity += float(data['quantity'])
            position.save()
            return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        position = Position(stock=data['stock'], quantity=float(data['quantity']), average_price=float(data['average_price']), timestamp=data['date'])
        position.save()
        return Response(position, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def close_position(request, pk):
    try:
        position = Position.objects.get(pk=pk)
    except Position.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    print(position.stock)
    print(position.stock.followed)
    if position.stock.followed:
        position.stock.owned = False
        print(position.stock.owned)
        position.stock.save()
    else:
        position.stock.delete()
    position.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
