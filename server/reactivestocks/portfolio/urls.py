from .views import open_position, close_position, get_positions
from django.urls import path


urlpatterns = [
    path('', get_positions, name='get_positions'),
    path('open/', open_position, name='open_position'),
    path('close/<int:pk>/', close_position, name='close_position')
]
