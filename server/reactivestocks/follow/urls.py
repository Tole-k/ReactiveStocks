from django.urls import path
from .views import get_followed_stocks, add_stock, remove_stock, get_suggestions

urlpatterns = [
    path('', get_followed_stocks, name='get_stocks'),
    path('add/', add_stock, name='add_stock'),
    path('remove/<int:pk>/', remove_stock, name='remove_stock'),
    path('suggestions/<str:symbol>/',
         get_suggestions, name='get_suggestions'),

]
