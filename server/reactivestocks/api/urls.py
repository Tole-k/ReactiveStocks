from django.urls import path
from .views import get_followed_stocks, add_stock, remove_stock, get_suggestions, open_position, close_position

urlpatterns = [
    path('stocks/', get_followed_stocks, name='get_stocks'),
    path('stocks/add/', add_stock, name='add_stock'),
    path('stocks/remove/<int:pk>/', remove_stock, name='remove_stock'),
    path('stocks/suggestions/<str:symbol>/',
         get_suggestions, name='get_suggestions'),
    path('stocks/open/', open_position, name='open_position'),
    path('stocks/close/<int:pk>/', close_position, name='close_position')
]
