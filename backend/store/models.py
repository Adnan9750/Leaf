import uuid
from decimal import Decimal
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")

    # Relation 2: Vendor (Links to VendorProfile, CASCADE on vendor removal)
    vendor = models.ForeignKey(
        "accounts.VendorProfile",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="products",
        help_text="Vendor/Merchant selling this product",
    )

    # Core product details
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        help_text="Stock Keeping Unit (auto-generated if left blank)",
    )
    description = models.TextField(blank=True, default="")
    short_description = models.CharField(max_length=500, blank=True, default="")

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Current retail selling price in PKR",
    )
    compare_at_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Original price before discount (for strikethrough display)",
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Vendor cost per unit (for profit/margin calculation)",
    )

    # Inventory Tracking
    stock = models.PositiveIntegerField(
        default=0,
        help_text="Available stock quantity in warehouse/store",
    )
    low_stock_threshold = models.PositiveIntegerField(
        default=5,
        help_text="Minimum stock level before triggering low-stock warning",
    )

    # Media
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
        help_text="Primary thumbnail/cover image",
    )

    # Status & Visibility Flags
    is_active = models.BooleanField(
        default=True,
        help_text="Controls if the product listing is active and discoverable",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PUBLISHED,
        help_text="Listing publication state (draft, published, archived)",
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Featured on homepage or catalog spotlight",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["sku"]),
            models.Index(fields=["is_active", "status"]),
            models.Index(fields=["category"]),
            models.Index(fields=["vendor"]),
        ]

    def __str__(self):
        return self.name

    @property
    def is_in_stock(self) -> bool:
        return self.stock > 0

    @property
    def is_low_stock(self) -> bool:
        return 0 < self.stock <= self.low_stock_threshold

    @property
    def is_out_of_stock(self) -> bool:
        return self.stock == 0

    @property
    def vendor_company(self) -> str:
        return self.vendor.company_name if self.vendor else "Leaf Direct"

    @property
    def category_name(self) -> str:
        return self.category.name if self.category else "Uncategorized"

    @property
    def discount_percentage(self) -> int:
        if self.compare_at_price and self.compare_at_price > self.price and self.compare_at_price > 0:
            diff = self.compare_at_price - self.price
            return int(round((diff / self.compare_at_price) * 100))
        return 0

    def save(self, *args, **kwargs):
        # Auto-generate unique slug
        if not self.slug:
            base_slug = slugify(self.name) or "product"
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Auto-generate unique SKU if left blank
        if not self.sku:
            prefix = "LF"
            unique_code = uuid.uuid4().hex[:8].upper()
            self.sku = f"{prefix}-{unique_code}"

        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        help_text="Associated product",
    )
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=255, blank=True, default="")
    is_feature = models.BooleanField(
        default=False,
        help_text="Flag this image as key showcase preview",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_feature", "-created_at"]

    def __str__(self):
        return f"Image for {self.product.name}"