from django.urls import path
from .views import UserView, LogoutView

urlpatterns = [
    path('whoami/', UserView.as_view(), name='whoami'),
    path('logout/', LogoutView.as_view(), name='logout')
]
