from django.urls import path
from .views import FollowView, AddStockView, RemoveStockView

urlpatterns = [
    path('', FollowView.as_view(), name='get_stocks'),
    path('add/', AddStockView.as_view(), name='add_stock'),
    path('remove/<int:pk>/', RemoveStockView.as_view(), name='remove_stock'),
]
