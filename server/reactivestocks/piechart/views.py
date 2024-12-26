from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Portfolio
from .serializer import PortfolioSerializer
from portfolio.serializer import DummyPositionSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from portfolio.models import DummyPosition
import requests
from follow.serializer import StockSerializer
from follow.models import Stock

APIKEY = "smwtbHsasmvEoGzGfDTq5Wo5xcqVHQvu"


class PortfolioView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if not Portfolio.objects.filter(user=request.user).exists():
            return Response(status=status.HTTP_204_NO_CONTENT)
        portfolios = Portfolio.objects.filter(user=request.user)
        serializedData = PortfolioSerializer(portfolios, many=True).data
        return Response(serializedData)


class CreatePortfolioView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        data = request.data
        data["user"] = request.user.id
        serializer = PortfolioSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddPortfolioAllocationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        portfolio = Portfolio.objects.get(pk=pk, user=request.user)
        data = request.data
        symbol = data["symbol"]

        stock = Stock.objects.filter(symbol=symbol).first()
        if stock is None:
            stock_data = requests.get(
                f"https://financialmodelingprep.com/api/v3/quote/{
                    symbol}?apikey={APIKEY}"
            ).json()
            if len(stock_data) == 0:
                return JsonResponse(
                    {"message": "Stock not found"}, status=status.HTTP_404_NOT_FOUND
                )
            stock_data = stock_data[0]
            serializer = StockSerializer(data=stock_data)
            if serializer.is_valid():
                serializer.save()
                stock = Stock.objects.get(symbol=symbol)
                stock.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if stock is None:
            return JsonResponse(
                {"message": "Stock could not be created or retrieved"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allocation = data["allocation"]
        dummy_position = DummyPosition.objects.filter(
            portfolio=portfolio, stock=stock
        ).first()
        if dummy_position is None:
            current_allocation = sum(
                [
                    position.allocation
                    for position in DummyPosition.objects.filter(portfolio=portfolio)
                ]
            ) + float(allocation)
            if current_allocation > 1:
                return JsonResponse(
                    {"message": "Allocation exceeds 100%"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            dummy_position = DummyPosition.objects.create(
                portfolio=portfolio, stock=stock, allocation=allocation
            )
        else:
            current_allocation = (
                sum(
                    [
                        position.allocation
                        for position in DummyPosition.objects.filter(
                            portfolio=portfolio,
                        )
                    ]
                )
                + float(allocation)
                - float(dummy_position.allocation)
            )
            if current_allocation > 1:
                return JsonResponse(
                    {"message": "Allocation exceeds 100%"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            dummy_position.allocation = allocation
            if dummy_position.allocation == 0:
                dummy_position.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                dummy_position.save()
        return JsonResponse(
            DummyPositionSerializer(
                dummy_position).data, status=status.HTTP_201_CREATED
        )
