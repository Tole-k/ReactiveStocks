from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests

APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


def update(stock):
    symbol = stock.symbol
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()[0]
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
def get_followed_stocks(request):
    if not Stock.objects.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)
    stocks = Stock.objects.filter(followed=True)
    for stock in stocks:
        update(stock)
    serializedData = StockSerializer(Stock.objects.all(), many=True).data
    return Response(serializedData)


@api_view(['GET'])
def get_suggestions(request, symbol):
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/search?query={symbol}&limit=5&apikey={APIKEY}').json()
    return Response(data)


@api_view(['POST'])
def add_stock(request):
    symbol = request.data['symbol']
    if Stock.objects.filter(symbol=symbol).exists():
        if Stock.objects.get(symbol=symbol).followed:
            return Response(status=status.HTTP_409_CONFLICT)
        stock = Stock.objects.get(symbol=symbol)
        stock.followed = True
        stock.save()
        return Response(StockSerializer(stock).data, status=status.HTTP_201_CREATED)
    else:
        data = requests.get(
            f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
        data[0]['followed'] = True
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
    if not stock.owned:
        stock.delete()
    else:
        stock.followed = False
        stock.save()
    return Response(status=status.HTTP_204_NO_CONTENT)
