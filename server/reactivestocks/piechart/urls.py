from .views import PortfolioView, CreatePortfolioView, AddPortfolioAllocationView
from django.urls import path


urlpatterns = [
    path('', PortfolioView.as_view(), name='get_positions'),
    path('add/', CreatePortfolioView.as_view(), name='add_portfolio'),
    path('add_allocation/<int:pk>/',
         AddPortfolioAllocationView.as_view(), name='add_allocation'),
]
