from .views import PortfolioView, OpenPositionView, ClosePositionView, PortfolioAllocationView
from django.urls import path


urlpatterns = [
    path('<int:pk>/', PortfolioView.as_view(), name='get_positions'),
    path('allocation/<int:pk>/',
         PortfolioAllocationView.as_view(), name='get_allocations'),
    path('open/<int:pk>/',
         OpenPositionView.as_view(), name='open_position'),
    path('close/<int:pk>/',
         ClosePositionView.as_view(), name='close_position')
]
