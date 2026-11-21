from django.contrib import admin
from .models import Category, Product, ProductImage, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_feature")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "vendor",
        "price",
        "stock",
        "is_active",
        "status",
        "created_at",
    )
    list_filter = ("is_active", "status", "category", "vendor", "is_featured", "created_at")
    search_fields = ("name", "sku", "description", "category__name", "vendor__company_name")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "is_feature", "created_at")
    list_filter = ("is_feature", "created_at")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price", "subtotal")
    fields = ("product", "quantity", "price", "subtotal")

    def subtotal(self, obj):
        return obj.subtotal
    subtotal.short_description = "Subtotal"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id", "full_name", "phone", "email",
        "status", "total_amount", "payment_method", "created_at",
    )
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("full_name", "email", "phone", "address")
    readonly_fields = ("created_at", "updated_at", "total_amount", "payment_method")
    inlines = [OrderItemInline]
