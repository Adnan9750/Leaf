from django.urls import path
from .views import signup_view, login_view, refresh_view, logout_view, vendor_list_view

urlpatterns = [
    path("signup", signup_view),
    path("login", login_view),
    path("refresh", refresh_view),
    path("logout", logout_view),
    path("vendors", vendor_list_view),
]