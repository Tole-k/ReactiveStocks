from math import log, perm
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Position, Stock
from .serializer import PositionSerializer
from follow.serializer import StockSerializer
import requests
from follow.views import update
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


class PortfolioView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        if not Position.objects.exists():
            return Response(status=status.HTTP_204_NO_CONTENT)
        positions = Position.objects.filter(user=request.user)
        stocks = [position.stock for position in positions]
        update(stocks)
        serializedData = PositionSerializer(positions, many=True).data
        return Response(serializedData)


class OpenPositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        data = request.data['positionData']
        symbol = data['symbol']
        stock = Stock.objects.get(symbol=symbol, user=request.user) if Stock.objects.filter(
            symbol=symbol, user=request.user).exists() else None
        if stock is None:
            stock_data = requests.get(
                f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()[0]
            stock_data['owned'] = True
            stock_data['user'] = request.user.id
            serializer = StockSerializer(data=stock_data)
            if serializer.is_valid():
                serializer.save()
                stock = Stock.objects.get(symbol=symbol, user=request.user)
                data['stock'] = stock
                position = Position(stock=data['stock'], quantity=float(
                    data['quantity']), average_price=float(data['average_price']), timestamp=data['date'], user=request.user)
                position.save()
                return JsonResponse(position.serialize(), status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            data['stock'] = stock
            position = Position.objects.filter(stock=stock).first()
            if position is not None:
                position.average_price = (position.average_price * position.quantity +
                                          float(data['average_price']) * float(data['quantity']))/(position.quantity + float(data['quantity']))
                position.quantity += float(data['quantity'])
                position.save()
                return JsonResponse(position.serialize(), status=status.HTTP_201_CREATED)
            position = Position(stock=data['stock'], quantity=float(
                data['quantity']), average_price=float(data['average_price']), timestamp=data['date'], user=request.user)
            position.save()
            stock.owned = True
            stock.save()
            return JsonResponse(position.serialize(), status=status.HTTP_201_CREATED)


class ClosePositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def delete(self, request, pk):
        try:
            position = Position.objects.get(pk=pk)
        except Position.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        position.stock.owned = False
        position.stock.save()
        position.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
