from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    products_view,
    product_detail_view,
    public_products_view,
    public_product_detail_view,
    public_categories_view,
    place_order_view,
    order_detail_view,
    admin_orders_view,
    admin_order_detail_view,
)

urlpatterns = [
    # Admin & Vendor Protected APIs
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('products/', products_view, name='product-list-create'),
    path('products/<int:pk>/', product_detail_view, name='product-detail'),
    path('orders/', admin_orders_view, name='admin-order-list'),
    path('orders/<int:order_id>/', admin_order_detail_view, name='admin-order-detail'),

    # Public Storefront APIs (AllowAny / Unauthenticated)
    path('public/products/', public_products_view, name='public-product-list'),
    path('public/products/<str:slug_or_id>/', public_product_detail_view, name='public-product-detail'),
    path('public/categories/', public_categories_view, name='public-category-list'),

    # Public Order APIs
    path('public/orders/', place_order_view, name='place-order'),
    path('public/orders/<int:order_id>/', order_detail_view, name='order-detail'),
]
