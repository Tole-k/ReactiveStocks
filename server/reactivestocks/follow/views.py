from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializer import StockSerializer
import requests
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from utils.stock_updater import update
APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


class FollowView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        if not Stock.objects.filter(users__id=request.user.id).exists():
            return Response(status=status.HTTP_204_NO_CONTENT)
        stocks = Stock.objects.filter(users__id=request.user.id)
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
                return JsonResponse({'message': 'Stock already followed'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            stock_data = requests.get(
                f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
            if len(stock_data) == 0:
                return JsonResponse({"message": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)
            stock_data = stock_data[0]
            serializer = StockSerializer(data=stock_data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
        stock = Stock.objects.get(symbol=symbol)
        stock.users.add(request.user)
        stock.save()
        return Response(StockSerializer(stock).data, status=status.HTTP_201_CREATED)


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
