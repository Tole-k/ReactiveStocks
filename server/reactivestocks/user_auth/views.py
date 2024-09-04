from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from .models import User
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


class HomeView(APIView):

    permission_classes = (IsAuthenticated, )

    def get(self, request):
        print(request.user)
        user = request.user
        content = {
            'message': f'{user.username} is logged in'}
        return Response(content)


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


@api_view(['POST'])
def login_view(request):
    data = request.data
    print(data)
    # Attempt to sign user in
    username = data["username"]
    password = data["password"]
    user = authenticate(request, username=username, password=password)
    print(user)
    # Check if authentication successful
    if user is not None:
        login(request, user)
        return JsonResponse({"message": "User logged in successfully"}, status=status.HTTP_202_ACCEPTED)
    else:
        return JsonResponse({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "User logged out successfully"}, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
def register(request):
    data = request.data
    username = data["username"]
    email = data["email"]
    # Ensure password matches confirmation
    password = data["password"]
    confirmation = data["confirmation"]
    if password != confirmation:
        return JsonResponse({
            "message": "Passwords must match."}, status=status.HTTP_400_BAD_REQUEST
        )
    # Attempt to create new user
    try:
        user = User.objects.create_user(username, email, password)
        user.save()
    except IntegrityError:
        return JsonResponse({"message": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
    login(request, user)
    return JsonResponse({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def whoami(request):
    if request.user.is_authenticated:
        return JsonResponse({"username": request.user.username}, status=status.HTTP_200_OK)
    else:
        return JsonResponse({"username": None}, status=status.HTTP_204_NO_CONTENT)
