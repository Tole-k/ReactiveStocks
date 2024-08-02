import re
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests
import pandas as pd
from pandas.tseries.holiday import USFederalHolidayCalendar
from pandas.tseries.offsets import CustomBusinessDay

US_BUSINESS_DAY = CustomBusinessDay(calendar=USFederalHolidayCalendar())
APIKEY = 'JOFNAS2BGJEJJOCD'


def adjust_json_format(data):
    data['symbol'] = data['Global Quote']['01. symbol']
    data['open_price'] = data['Global Quote']['02. open']
    data['high'] = data['Global Quote']['03. high']
    data['low'] = data['Global Quote']['04. low']
    data['price'] = data['Global Quote']['05. price']
    data['volume'] = data['Global Quote']['06. volume']
    data['latest_trading_day'] = data['Global Quote']['07. latest trading day']
    data['previous_close'] = data['Global Quote']['08. previous close']
    data['change'] = data['Global Quote']['09. change']
    data['change_percent'] = data['Global Quote']['10. change percent'][:-1]
    return data


def update(stock):
    symbol = stock.symbol
    data = requests.get(
        f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={APIKEY}').json()
    data = adjust_json_format(data)
    stock.open_price = data['open_price']
    stock.high = data['high']
    stock.low = data['low']
    stock.price = data['price']
    stock.volume = data['volume']
    stock.latest_trading_day = data['latest_trading_day']
    stock.previous_close = data['previous_close']
    stock.change = data['change']
    stock.change_percent = data['change_percent']
    stock.save()


@api_view(['GET'])
def get_stocks(request):
    stocks = Stock.objects.all()
    for stock in stocks:
        if stock.latest_trading_day != (pd.Timestamp.now().normalize() - US_BUSINESS_DAY).to_pydatetime().date():
            update(stock)
    serializedData = StockSerializer(Stock.objects.all(), many=True).data
    return Response(serializedData)


@api_view(['GET'])
def get_suggestions(request, symbol):
    print(symbol)
    data = requests.get(
        f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${APIKEY}').json()
    print(data)
    return Response(data)


@api_view(['POST'])
def add_stock(request):
    symbol = request.data['symbol']
    data = requests.get(
        f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={APIKEY}').json()
    data = adjust_json_format(data)
    serializer = StockSerializer(data=data)
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
