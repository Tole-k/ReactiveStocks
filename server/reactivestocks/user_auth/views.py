from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class Register(APIView):
    def post(self, request):
        credentials = request.data
        username = credentials['username']
        email = credentials['email']
        password = credentials['password']
        confirm_password = credentials['confirm_password']
        if password != confirm_password:
            return JsonResponse({'message': "passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'message': "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(
            username=username, email=email, password=password)
        user.save()
        return Response(status=status.HTTP_201_CREATED)


class UserView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        user = request.user
        return Response(user.serialize())


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
