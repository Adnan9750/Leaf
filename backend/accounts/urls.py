from django.urls import path
from .views import (
    signup_view,
    login_view,
    refresh_view,
    logout_view,
    vendor_list_view,
    vendor_status_update_view,
    vendor_approve_view,
    vendor_reject_view,
)

urlpatterns = [
    path("signup", signup_view),
    path("login", login_view),
    path("refresh", refresh_view),
    path("logout", logout_view),
    path("vendors", vendor_list_view),
    path("vendors/<int:vendor_id>/status", vendor_status_update_view),
    path("vendors/<int:vendor_id>/approve", vendor_approve_view),
    path("vendors/<int:vendor_id>/reject", vendor_reject_view),
]