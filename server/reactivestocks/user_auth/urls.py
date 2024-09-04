from django.urls import path
from .views import login_view, logout_view, register, whoami, HomeView, LogoutView

urlpatterns = [
    # path('login/', login_view, name='login'),
    # path('logout/', logout_view, name='logout'),
    # path('register/', register, name='register'),
    # path('whoami/', whoami, name='whoami'),
    path('home/', HomeView.as_view(), name='home'),
    path('logout/', LogoutView.as_view(), name='logout')
]
