from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from piechart.models import Portfolio
from .models import Position, Stock
from .serializer import PositionSerializer
from follow.serializer import StockSerializer
import requests
from follow.views import update
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
updater = True
APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


class PortfolioView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, pk):
        try:
            if not Position.objects.filter(user=request.user).exists():
                return Response(status=status.HTTP_204_NO_CONTENT)
            positions = Position.objects.filter(
                user=request.user, portfolio=pk)
            stocks = [position.stock for position in positions]
            if updater:
                update(stocks)
            serializedData = PositionSerializer(positions, many=True).data
            return Response(serializedData)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpenPositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, pk):
        try:
            portfolio = Portfolio.objects.get(pk=pk)
            data = request.data
            symbol = data['symbol']
            stock = Stock.objects.filter(symbol=symbol).first()
            if stock is None:
                stock_data = requests.get(
                    f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()[0]
                serializer = StockSerializer(data=stock_data)
                if serializer.is_valid():
                    serializer.save()
                    stock = Stock.objects.get(symbol=symbol)
                    stock.users.add(request.user)
                    stock.save()
                else:
                    print(serializer.errors)
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            if stock is None:
                return Response({"error": "Stock could not be created or retrieved"}, status=status.HTTP_400_BAD_REQUEST)
            position = Position.objects.filter(
                stock=stock, portfolio=portfolio, user=request.user).first()
            if position:
                position.average_price = (position.average_price * position.quantity +
                                          float(data['average_price']) * float(data['quantity'])) / (position.quantity + float(data['quantity']))
                position.quantity += float(data['quantity'])
                position.save()
            else:
                position = Position(stock=stock, quantity=float(
                    data['quantity']), average_price=float(data['average_price']), timestamp=data['date'], user=request.user, portfolio=portfolio)
                position.save()
            return JsonResponse(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClosePositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def delete(self, request, pk):
        try:
            position = Position.objects.get(pk=pk)
        except Position.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        stock = position.stock
        stock.users.remove(request.user)
        position.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)