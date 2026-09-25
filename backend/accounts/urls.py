from django.urls import path
from .views import login_view, refresh_view, logout_view, vendor_list_view

urlpatterns = [
    path("login", login_view),
    path("refresh", refresh_view),
    path("logout", logout_view),
    # path("vendors/", vendor_list_view, name="vendor-list"),
    path("vendors", vendor_list_view),
]