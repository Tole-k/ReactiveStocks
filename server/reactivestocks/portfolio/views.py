from datetime import datetime
import time
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import DummyPosition, Position, Stock, Transaction, Portfolio
from .serializer import PositionSerializer, DummyPositionSerializer
from follow.serializer import StockSerializer
import requests
from follow.views import update
from rest_framework.views import APIView
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
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioAllocationView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, pk):
        try:
            if not DummyPosition.objects.filter(user=request.user).exists():
                return Response(status=status.HTTP_204_NO_CONTENT)
            positions = DummyPosition.objects.filter(
                user=request.user, portfolio=pk)
            serializedData = DummyPositionSerializer(positions, many=True).data
            return Response(serializedData)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpenPositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, pk):
        try:
            portfolio = Portfolio.objects.get(pk=pk)
            data = request.data
            print(data)
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
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            if stock is None:
                return Response({"error": "Stock could not be created or retrieved"}, status=status.HTTP_400_BAD_REQUEST)
            position = Position.objects.filter(
                stock=stock, portfolio=portfolio, user=request.user).first()
            if position is None:
                position = Position.objects.create(
                    stock=stock, portfolio=portfolio, user=request.user, quantity=data['quantity'], average_price=data['average_price'])

            timestamp = data.get('timestamp', None)
            if timestamp is None:
                timestamp = time.time()
            transaction = Transaction.objects.create(
                position=position, quantity=data['quantity'], average_price=data['average_price'], timestamp=timestamp)
            print(transaction.timestamp)
            position.update()
            position.save()
            return JsonResponse(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClosePositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, pk):
        try:
            data = request.data
            if 'quantity' not in data:
                return Response({"error": "Quantity is required"}, status=status.HTTP_400_BAD_REQUEST)

            position = Position.objects.get(pk=pk)
            if position.quantity < float(data['quantity']):
                return Response({"error": "Not enough shares to sell"}, status=status.HTTP_400_BAD_REQUEST)

            Transaction.objects.create(
                position=position, quantity=-float(data['quantity']), average_price=data['average_price'], timestamp=datetime.now().isoformat())
            position.update()
            if position.quantity == 0:
                position.delete()
                return Response({"message": "Position closed successfully"}, status=status.HTTP_200_OK)
            else:
                position.save()
                return JsonResponse(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
