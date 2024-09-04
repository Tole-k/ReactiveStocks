from django.urls import path
from .views import HomeView, LogoutView

urlpatterns = [
    path('home/', HomeView.as_view(), name='home'),
    path('logout/', LogoutView.as_view(), name='logout')
]
