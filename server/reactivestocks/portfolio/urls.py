from .views import PortfolioView, OpenPositionView, ClosePositionView
from django.urls import path


urlpatterns = [
    path('', PortfolioView.as_view(), name='get_positions'),
    path('open/', OpenPositionView.as_view(), name='open_position'),
    path('close/<int:pk>/', ClosePositionView.as_view(), name='close_position')
]
