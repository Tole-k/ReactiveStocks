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
    for position in positions:
        stock = position.stock
        update(stock)
    serializedData = PositionSerializer(positions, many=True).data
    return Response(serializedData)


@api_view(['POST'])
def open_position(request):
    data = request.data['positionData']
    symbol = data['symbol']
    stock = Stock.objects.filter(symbol=data['symbol']).first()
    if stock is None:
        stock_data = requests.get(
            f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
        stock_data[0]['owned'] = True
        serializer = StockSerializer(data=stock_data[0])
        if serializer.is_valid():
            serializer.save()
            stock = Stock.objects.filter(symbol=data['symbol']).first()
            data['stock'] = stock.id  # type: ignore
            serializer = PositionSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        position = Position.objects.filter(stock=stock).first()
        if position is not None:
            position.average_price = (position.average_price * position.quantity +
                                      float(data['average_price']) * float(data['quantity']))/(position.quantity + float(data['quantity']))
            position.quantity += float(data['quantity'])
            position.save()
            return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        data['stock'] = stock.id  # type: ignore
        serializer = PositionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            stock.owned = True
            stock.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def close_position(request, pk):
    try:
        position = Position.objects.get(pk=pk)
    except Position.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    position.stock.owned = False
    position.stock.save()
    position.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
