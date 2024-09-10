from pickle import TRUE
from turtle import st
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
updater = True

APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


def update(stocks):
    if len(stocks) == 0:
        return
    symbols = ','.join([stock.symbol for stock in stocks])
    data = requests.get(
        f'https://financialmodelingprep.com/api/v3/quote/{symbols}?apikey={APIKEY}').json()
    for i, stock in enumerate(stocks):
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


class FollowView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        if not Stock.objects.filter(users__id=request.user.id).exists():
            return Response(status=status.HTTP_204_NO_CONTENT)
        stocks = Stock.objects.filter(users__id=request.user.id)
        if updater:
            update(stocks)
        serializedData = StockSerializer(
            Stock.objects.filter(users__id=request.user.id), many=True).data
        return Response(serializedData)


class SuggestionsView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, symbol):
        data = requests.get(
            f'https://financialmodelingprep.com/api/v3/search?query={symbol}&limit=5&apikey={APIKEY}').json()
        return Response(data)


class AddStockView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        symbol = request.data['symbol']
        if Stock.objects.filter(symbol=symbol).exists():
            if Stock.objects.filter(symbol=symbol, users__id=request.user.id).exists():
                return Response(status=status.HTTP_409_CONFLICT)
            stock = Stock.objects.get(symbol=symbol)
            stock.users.add(request.user)
            stock.save()
            return Response(StockSerializer(stock).data, status=status.HTTP_201_CREATED)
        else:
            data = requests.get(
                f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()[0]
            serializer = StockSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                stock = Stock.objects.get(symbol=symbol)
                stock.users.add(request.user)
                stock.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveStockView(APIView):
    permission_classes = (IsAuthenticated, )

    def delete(self, request, pk):
        try:
            stock = Stock.objects.get(pk=pk)
        except Stock.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        stock.users.remove(request.user)
        stock.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
