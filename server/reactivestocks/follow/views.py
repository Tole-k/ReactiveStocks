from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests
from django.contrib.auth.decorators import login_required

APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


def update(stocks):
    if len(stocks) == 0:
        return
    symbols = ','.join([stock.symbol for stock in stocks])
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/quote/{symbols}?apikey={APIKEY}').json()
    for i, stock in enumerate(stocks):
        if (not stock.followed) and (not stock.owned):
            stock.delete()
            continue
        stock.price = data[i]['price']
        stock.changesPercentage = data[i]['changesPercentage']
        stock.change = data[i]['change']
        stock.dayLow = data[i]['dayLow']
        stock.dayHigh = data[i]['dayHigh']
        stock.yearHigh = data[i]['yearHigh']
        stock.yearLow = data[i]['yearLow']
        stock.marketCap = data[i]['marketCap']
        stock.priceAvg50 = data[i]['priceAvg50']
        stock.priceAvg200 = data[i]['priceAvg200']
        stock.volume = data[i]['volume']
        stock.avgVolume = data[i]['avgVolume']
        stock.open = data[i]['open']
        stock.previousClose = data[i]['previousClose']
        stock.eps = data[i]['eps']
        stock.pe = data[i]['pe']
        stock.earningsAnnouncement = data[i]['earningsAnnouncement']
        stock.sharesOutstanding = data[i]['sharesOutstanding']
        stock.timestamp = data[i]['timestamp']
        stock.save()


@login_required
@api_view(['GET'])
def get_followed_stocks(request):
    if not Stock.objects.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)
    stocks = Stock.objects.all()
    update(stocks)
    serializedData = StockSerializer(
        Stock.objects.all(), many=True).data
    return Response(serializedData)


@login_required
@api_view(['GET'])
def get_suggestions(request, symbol):
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/search?query={symbol}&limit=5&apikey={APIKEY}').json()
    return Response(data)


@login_required
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


@login_required
@api_view(['DELETE'])
def remove_stock(request, pk):
    try:
        stock = Stock.objects.get(pk=pk)
    except Stock.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    stock.followed = False
    stock.save()
    return Response(status=status.HTTP_204_NO_CONTENT)
