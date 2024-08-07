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
    print("Received data:", data)
    symbol = data['symbol']
    stock = Stock.objects.filter(symbol=data['symbol']).first()
    print("Stock found:", stock)
    if stock is None:
        stock_data = requests.get(
            f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
        stock_data[0]['owned'] = True
        serializer = StockSerializer(data=stock_data[0])
        if serializer.is_valid():
            serializer.save()
            stock = Stock.objects.filter(symbol=data['symbol']).first()
            data['stock'] = stock
            data['stock_id'] = stock.id  # type: ignore
            print("Stock created and data updated:", data)
            serializer = PositionSerializer(data=data)
            if serializer.is_valid():
                print("Position serializer valid:", serializer.validated_data)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print("Position serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        print("Stock serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        data['stock'] = stock
        data['stock_id'] = stock.id  # type: ignore
        position = Position.objects.filter(stock=stock).first()
        if position is not None:
            position.average_price = (position.average_price * position.quantity +
                                      float(data['average_price']) * float(data['quantity']))/(position.quantity + float(data['quantity']))
            position.quantity += float(data['quantity'])
            position.save()
            return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        print("Existing stock and data updated:", data)
        serializer = PositionSerializer(data=data)
        if serializer.is_valid():
            print("Position serializer valid:", serializer.validated_data)
            serializer.save()
            stock.owned = True
            stock.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Position serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def close_position(request, pk):
    try:
        position = Position.objects.get(pk=pk)
    except Position.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if position.stock.followed:
        position.stock.owned = False
        position.stock.save()
    else:
        position.stock.delete()
    position.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
