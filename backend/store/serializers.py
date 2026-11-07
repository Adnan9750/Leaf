from rest_framework import serializers
from accounts.models import VendorProfile
from .models import Category, Product, ProductImage

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

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


# --------------------------------------------------------------------------
# Gallery image (used for output, and to validate each uploaded gallery file)
# --------------------------------------------------------------------------
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_feature", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_image(self, value):
        if value.size > MAX_IMAGE_SIZE:
            raise serializers.ValidationError("Image must be under 5 MB.")
        return value


# --------------------------------------------------------------------------
# OUTPUT: public product (store pages). No private fields here.
# Load with: Product.objects.select_related("vendor", "category").prefetch_related("images")
# Pass context={"request": request} so image URLs are complete.
# --------------------------------------------------------------------------
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    vendor_name = serializers.CharField(source="vendor.company_name", read_only=True, default="Leaf Direct")

    images = ProductImageSerializer(many=True, read_only=True)

    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "sku", "brand",
            "short_description", "description",
            "price", "compare_at_price", "discount_percentage",
            "unit", "pack_size",
            "stock", "is_in_stock", "is_low_stock", "is_out_of_stock",
            "active_ingredient", "usage_instructions", "safety_precautions", "is_organic",
            "image", "images",
            "is_featured",
            "category", "category_name", "category_slug",
            "vendor", "vendor_name",
            "created_at", "updated_at",
        ]
        read_only_fields = fields  # output only; input goes through the create/update serializers


# --------------------------------------------------------------------------
# OUTPUT: for the owning vendor and the superadmin (adds the private fields)
# --------------------------------------------------------------------------
class ProductOwnerSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + [
            "cost_price", "low_stock_threshold",
            "status", "is_active", "blocked_reason",
        ]
        read_only_fields = fields


# --------------------------------------------------------------------------
# INPUT: create product (vendor-controlled fields only)
# --------------------------------------------------------------------------
class ProductCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.filter(is_active=True),
        error_messages={"does_not_exist": "Category not found or not active."},
    )

    class Meta:
        model = Product
        fields = [
            "name", "category_id", "brand", "short_description", "description",
            "price", "compare_at_price", "cost_price",
            "unit", "pack_size", "stock", "low_stock_threshold",
            "active_ingredient", "usage_instructions", "safety_precautions", "is_organic",
            "image", "status",
        ]
        # NOT accepted from the client (set by the server or the superadmin):
        # vendor, slug, sku, is_active, is_featured, blocked_reason

    def validate_status(self, value):
        if value not in (Product.Status.DRAFT, Product.Status.PUBLISHED):
            raise serializers.ValidationError("Choose draft or published.")
        return value

    def validate_image(self, value):
        if value and value.size > MAX_IMAGE_SIZE:
            raise serializers.ValidationError("Image must be under 5 MB.")
        return value

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        compare = attrs.get("compare_at_price", getattr(self.instance, "compare_at_price", None))
        if price is not None and compare is not None and compare <= price:
            raise serializers.ValidationError(
                {"compare_at_price": "Must be higher than the selling price."}
            )
        return attrs

# class ProductSerializer(serializers.ModelSerializer):
#     """
#     Comprehensive Product serializer.
#     Includes relational fields for Category and Vendor.
#     """
#     # Relational Read-only expansions
#     category_name = serializers.CharField(source="category.name", read_only=True, default="Uncategorized")
#     category_slug = serializers.CharField(source="category.slug", read_only=True, default="")
#     vendor_name = serializers.CharField(source="vendor.company_name", read_only=True, default="Leaf Direct")
#     vendor_currency = serializers.CharField(source="vendor.currency", read_only=True, default="PKR")

#     # Nested Gallery Images
#     images = ProductImageSerializer(many=True, read_only=True)

#     # Computed Properties
#     is_in_stock = serializers.BooleanField(read_only=True)
#     is_low_stock = serializers.BooleanField(read_only=True)
#     is_out_of_stock = serializers.BooleanField(read_only=True)
#     discount_percentage = serializers.IntegerField(read_only=True)

#     class Meta:
#         model = Product
#         fields = [
#             'id',
#             'name',
#             'slug',
#             'sku',
#             'description',
#             'short_description',
#             'price',
#             'compare_at_price',
#             'cost_price',
#             'stock',
#             'low_stock_threshold',
#             'image',
#             'images',
#             'is_active',
#             'status',
#             'is_featured',
#             'category',
#             'category_name',
#             'category_slug',
#             'vendor',
#             'vendor_name',
#             'vendor_currency',
#             'is_in_stock',
#             'is_low_stock',
#             'is_out_of_stock',
#             'discount_percentage',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = ['id', 'slug', 'sku', 'created_at', 'updated_at']

#     def validate_price(self, value):
#         if value < 0:
#             raise serializers.ValidationError("Price cannot be negative.")
#         return value

#     def validate_stock(self, value):
#         if value < 0:
#             raise serializers.ValidationError("Stock cannot be negative.")
#         return value
