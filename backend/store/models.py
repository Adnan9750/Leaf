import uuid
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    # unchanged from your file
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
            base_slug = slugify(self.name) or "category"
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

    class Unit(models.TextChoices):
        ML = "ml", "ml"
        LITER = "l", "Liter"
        GRAM = "g", "Gram"
        KG = "kg", "Kg"
        PACK = "pack", "Pack"
        PIECE = "piece", "Piece"

    # ---- Relations
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    vendor = models.ForeignKey(
        "accounts.VendorProfile",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="products",
        help_text="Vendor selling this product. Empty = sold by the store itself (Leaf Direct).",
    )

    # ---- Core details
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        help_text="Stock Keeping Unit (auto-generated if left blank)",
    )
    brand = models.CharField(max_length=100, blank=True, default="")
    short_description = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField(blank=True, default="")

    # ---- Pricing (PKR)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Current selling price in PKR",
    )
    compare_at_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Original price before discount. Must be higher than price.",
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Vendor's private cost per unit. Never show publicly.",
    )

    # ---- Pack size (what the customer actually receives, e.g. 500 g)
    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.PIECE)
    pack_size = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Quantity per pack in the chosen unit, e.g. 500 with unit g",
    )

    # ---- Inventory
    stock = models.PositiveIntegerField(default=0, help_text="Available stock quantity")
    low_stock_threshold = models.PositiveIntegerField(
        default=5, help_text="Stock level that triggers a low-stock warning"
    )

    # ---- Agriculture details (vendor copies these from the real product label)
    active_ingredient = models.CharField(max_length=200, blank=True, default="")
    usage_instructions = models.TextField(blank=True, default="")
    safety_precautions = models.TextField(blank=True, default="")
    is_organic = models.BooleanField(default=False)

    # ---- Media
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
        help_text="Cover thumbnail. More photos go in ProductImage.",
    )

    # ---- Visibility
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PUBLISHED,
        help_text="Controlled by the VENDOR: draft, published or archived",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Controlled by the SUPERADMIN: False = blocked from the store",
    )
    blocked_reason = models.TextField(
        blank=True, default="", help_text="Why the superadmin blocked it (shown to the vendor)"
    )
    is_featured = models.BooleanField(default=False, help_text="Featured on homepage")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            # slug, sku and foreign keys are already indexed by Django
            models.Index(fields=["is_active", "status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=Decimal("0.01")),
                name="product_price_at_least_1_paisa",
            ),
            models.CheckConstraint(
                condition=models.Q(compare_at_price__isnull=True)
                | models.Q(compare_at_price__gt=models.F("price")),
                name="product_compare_price_above_price",
            ),
        ]

    def __str__(self):
        return self.name

    # NOTE: these read self.vendor / self.category. In async views always load
    # them together:  Product.objects.select_related("vendor", "category")
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
    def is_visible_in_store(self) -> bool:
        return self.is_active and self.status == self.Status.PUBLISHED

    @property
    def vendor_company(self) -> str:
        return self.vendor.company_name if self.vendor else "Leaf Direct"

    @property
    def category_name(self) -> str:
        return self.category.name

    @property
    def discount_percentage(self) -> int:
        if self.compare_at_price and self.compare_at_price > self.price:
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
            self.sku = f"LF-{uuid.uuid4().hex[:8].upper()}"

        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=255, blank=True, default="")
    is_feature = models.BooleanField(
        default=False, help_text="The main showcase image (only one per product)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_feature", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["product"],
                condition=models.Q(is_feature=True),
                name="one_feature_image_per_product",
            ),
        ]

    def __str__(self):
        return f"Image for {self.product.name}"