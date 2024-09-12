from rest_framework.response import Response
from rest_framework import status
from .models import Portfolio
from .serializer import PortfolioSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


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
