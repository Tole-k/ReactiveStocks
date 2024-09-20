from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Portfolio
from .serializer import PortfolioSerializer
from portfolio.serializer import DummyPositionSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from portfolio.models import DummyPosition


class PortfolioView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        if not Portfolio.objects.filter(user=request.user).exists():
            return Response(status=status.HTTP_204_NO_CONTENT)
        portfolios = Portfolio.objects.filter(user=request.user)
        serializedData = PortfolioSerializer(portfolios, many=True).data
        return Response(serializedData)


class CreatePortfolioView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        data = request.data
        data['user'] = request.user.id
        serializer = PortfolioSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddPortfolioAllocationView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, pk):
        portfolio = Portfolio.objects.get(pk=pk)
        data = request.data
        symbol = data['symbol']
        allocation = data['allocation']
        dummy_position = DummyPosition.objects.filter(
            portfolio=portfolio, stock=symbol, user=request.user).first()
        if dummy_position is None:
            current_allocation = sum(
                [position.allocation for position in DummyPosition.objects.filter(portfolio=portfolio, user=request.user)])+float(allocation)
            if current_allocation > 1:
                return Response({"error": "Allocation exceeds 100%"}, status=status.HTTP_400_BAD_REQUEST)
            dummy_position = DummyPosition.objects.create(
                portfolio=portfolio, stock=symbol, allocation=allocation, user=request.user)
        else:
            current_allocation = sum(
                [position.allocation for position in DummyPosition.objects.filter(portfolio=portfolio, user=request.user)])+float(allocation)-float(dummy_position.allocation)
            if current_allocation > 1:
                return Response({"error": "Allocation exceeds 100%"}, status=status.HTTP_400_BAD_REQUEST)
            dummy_position.allocation = allocation
            dummy_position.save()
        return JsonResponse(DummyPositionSerializer(dummy_position).data, status=status.HTTP_201_CREATED)
