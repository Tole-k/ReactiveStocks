from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests
from pandas.tseries.holiday import USFederalHolidayCalendar
from pandas.tseries.offsets import CustomBusinessDay

US_BUSINESS_DAY = CustomBusinessDay(calendar=USFederalHolidayCalendar())
APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


def update(stock):
    symbol = stock.symbol
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
    if data['Error Message']:
        return None
    data = data[0]
    stock.price = data['price']
    stock.changesPercentage = data['changesPercentage']
    stock.change = data['change']
    stock.dayLow = data['dayLow']
    stock.dayHigh = data['dayHigh']
    stock.yearHigh = data['yearHigh']
    stock.yearLow = data['yearLow']
    stock.marketCap = data['marketCap']
    stock.priceAvg50 = data['priceAvg50']
    stock.priceAvg200 = data['priceAvg200']
    stock.volume = data['volume']
    stock.avgVolume = data['avgVolume']
    stock.open = data['open']
    stock.previousClose = data['previousClose']
    stock.eps = data['eps']
    stock.pe = data['pe']
    stock.earningsAnnouncement = data['earningsAnnouncement']
    stock.sharesOutstanding = data['sharesOutstanding']
    stock.timestamp = data['timestamp']
    stock.save()


@api_view(['GET'])
def get_stocks(request):
    if not Stock.objects.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)
    stocks = Stock.objects.all()
    for stock in stocks:
        if update(stock) is None:
            return Response(status=status.HTTP_403_FORBIDDEN)
    serializedData = StockSerializer(Stock.objects.all(), many=True).data
    return Response(serializedData)


@api_view(['GET'])
def get_suggestions(request, symbol):
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/search?query={symbol}&limit=5&apikey={APIKEY}').json()
    if data['Error Message']:
        return Response(data['Error Message'], status=status.HTTP_403_FORBIDDEN)
    return Response(data)


@api_view(['POST'])
def add_stock(request):
    symbol = request.data['symbol']
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
    if data['Error Message']:
        return Response(data['Error Message'], status=status.HTTP_403_FORBIDDEN)
    serializer = StockSerializer(data=data[0])
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
