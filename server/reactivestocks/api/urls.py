from django.urls import path
from .views import get_stocks, add_stock, remove_stock

urlpatterns = [
    path('stocks/', get_stocks, name='get_stocks'),
    path('stocks/add/', add_stock, name='add_stock'),
    path('stocks/remove/<int:pk>/', remove_stock, name='remove_stock')
]
