from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests
import json

APIKEY = 'JOFNAS2BGJEJJOCD'
DATABASE_ACCESS = True


@api_view(['GET'])
def get_stocks(request):
    stocks = Stock.objects.all()
    serializedData = StockSerializer(stocks, many=True).data
    return Response(serializedData)


@api_view(['POST'])
def add_stock(request):
    ticker = request.data['symbol']
    print(ticker)
    data = requests.get(
        f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={APIKEY}').json()
    serializer = StockSerializer(data=data)
    data['price'] = data['Global Quote']['05. price']
    data['symbol'] = data['Global Quote']['01. symbol']
    data['change'] = data['Global Quote']['09. change']
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_stock(request, pk):
    try:
        stock = Stock.objects.get(pk=pk)
    except Stock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    stock.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)