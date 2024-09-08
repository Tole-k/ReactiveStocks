from django.urls import path
from .views import UserView, LogoutView, Register

urlpatterns = [
    path('register/', Register.as_view(), name='register'),
    path('whoami/', UserView.as_view(), name='whoami'),
    path('logout/', LogoutView.as_view(), name='logout')
]
