from .views import open_position, close_position, get_positions
from django.urls import path


urlpatterns = [
    path('positions/', get_positions, name='get_positions'),
    path('positions/open/', open_position, name='open_position'),
    path('positions/close/<int:pk>/', close_position, name='close_position')
]
