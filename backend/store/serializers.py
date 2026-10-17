from rest_framework import serializers
from .models import Category, Product, ProductImage
from accounts.models import VendorProfile


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model used by CRUD APIs."""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def validate_name(self, value):
        name = value.strip()
        if not name:
            raise serializers.ValidationError("Category name cannot be empty.")
        instance = getattr(self, 'instance', None)
        query = Category.objects.filter(name__iexact=name)
        if instance:
            query = query.exclude(pk=instance.pk)
        if query.exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return name


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for auxiliary gallery images."""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_feature', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """
    Comprehensive Product serializer.
    Includes relational fields for Category and Vendor.
    """
    # Relational Read-only expansions
    category_name = serializers.CharField(source="category.name", read_only=True, default="Uncategorized")
    category_slug = serializers.CharField(source="category.slug", read_only=True, default="")
    vendor_name = serializers.CharField(source="vendor.company_name", read_only=True, default="Leaf Direct")
    vendor_currency = serializers.CharField(source="vendor.currency", read_only=True, default="PKR")

    # Nested Gallery Images
    images = ProductImageSerializer(many=True, read_only=True)

    # Computed Properties
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'sku',
            'description',
            'short_description',
            'price',
            'compare_at_price',
            'cost_price',
            'stock',
            'low_stock_threshold',
            'image',
            'images',
            'is_active',
            'status',
            'is_featured',
            'category',
            'category_name',
            'category_slug',
            'vendor',
            'vendor_name',
            'vendor_currency',
            'is_in_stock',
            'is_low_stock',
            'is_out_of_stock',
            'discount_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'sku', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
