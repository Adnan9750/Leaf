from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    products_view,
    product_detail_view,
    public_products_view,
    public_product_detail_view,
    public_categories_view,
)

urlpatterns = [
    # Admin & Vendor Protected APIs
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('products/', products_view, name='product-list-create'),
    path('products/<int:pk>/', product_detail_view, name='product-detail'),

    # Public Storefront APIs (AllowAny / Unauthenticated)
    path('public/products/', public_products_view, name='public-product-list'),
    path('public/products/<str:slug_or_id>/', public_product_detail_view, name='public-product-detail'),
    path('public/categories/', public_categories_view, name='public-category-list'),
]
