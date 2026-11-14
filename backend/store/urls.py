from django.urls import path
from .views import CategoryListCreateView, CategoryDetailView, products_view, product_detail_view

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('products/', products_view, name='product-list-create'),
    path('products/<int:pk>/', product_detail_view, name='product-detail'),
]
