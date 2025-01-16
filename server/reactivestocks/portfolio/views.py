from datetime import datetime
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import DummyPosition, Position, Stock, Transaction, Portfolio
from .serializer import PositionSerializer, DummyPositionSerializer
from follow.serializer import StockSerializer
import requests
from utils.stock_updater import update
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
APIKEY = 'smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu'


class PortfolioView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, pk):
        try:
            if not Portfolio.objects.filter(user=request.user, id=pk).exists():
                return Response(status=status.HTTP_204_NO_CONTENT)
            if not Position.objects.filter(portfolio=pk).exists():
                return Response(status=status.HTTP_204_NO_CONTENT)
            positions = Position.objects.filter(portfolio=pk)
            stocks = [position.stock for position in positions]
            update(stocks)
            serializedData = PositionSerializer(positions, many=True).data
            return Response(serializedData)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PortfolioAllocationView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, pk):
        try:
            if not Portfolio.objects.filter(user=request.user, id=pk).exists():
                return Response(status=status.HTTP_204_NO_CONTENT)
            if not Position.objects.filter(portfolio=pk).exists():
                return Response(status=status.HTTP_204_NO_CONTENT)
            positions = DummyPosition.objects.filter(portfolio=pk)
            stocks = [position.stock for position in positions]
            update(stocks)
            serializedData = DummyPositionSerializer(positions, many=True).data
            return Response(serializedData)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpenPositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, pk):
        try:
            if not Portfolio.objects.filter(user=request.user, id=pk).exists():
                return Response(status=status.HTTP_403_FORBIDDEN)
            portfolio = Portfolio.objects.get(pk=pk, user=request.user)
            data = request.data
            symbol = data['symbol']
            if float(data['quantity']) <= 0:
                return JsonResponse({"message": "Quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
            if float(data['average_price']) <= 0:
                return JsonResponse({"message": "Average price must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
            timestamp = data['timestamp']
            if timestamp == '':
                timestamp = datetime.now().isoformat()
            stock = Stock.objects.filter(symbol=symbol).first()
            if stock is None:
                stock_data = requests.get(
                    f'https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={APIKEY}').json()
                if len(stock_data) == 0:
                    return JsonResponse({"message": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)
                stock_data = stock_data[0]
                serializer = StockSerializer(data=stock_data)
                if serializer.is_valid():
                    serializer.save()
                    stock = Stock.objects.get(symbol=symbol)
                    stock.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            if stock is None:
                return JsonResponse({"message": "Stock could not be created or retrieved"}, status=status.HTTP_400_BAD_REQUEST)
            position = Position.objects.filter(
                stock=stock, portfolio=portfolio).first()
            if position is None:
                position = Position.objects.create(
                    stock=stock, portfolio=portfolio, quantity=data['quantity'], average_price=data['average_price'])

            Transaction.objects.create(
                position=position, quantity=data['quantity'], average_price=data['average_price'], timestamp=timestamp)
            position.update()
            position.save()
            return JsonResponse(PositionSerializer(position).data, status=status.HTTP_201_CREATED)
        except Portfolio.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClosePositionView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, pk):
        try:
            data = request.data
            if 'quantity' not in data:
                return Response({"message": "Quantity is required"}, status=status.HTTP_400_BAD_REQUEST)

            position = Position.objects.get(pk=pk)
            if position.quantity < float(data['quantity']):
                return JsonResponse({"message": "Not enough shares to sell"}, status=status.HTTP_400_BAD_REQUEST)

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
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
