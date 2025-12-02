from django.urls import path
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, GetUser, RegisterUser

urlpatterns = [
    path("register/", RegisterUser.as_view(), name="accounts.register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="accounts.login"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="accounts.refresh"),
    path("", GetUser.as_view(), name="accounts.user"),
]

