from adrf.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from asgiref.sync import sync_to_async
from .models import Category
from .serializers import CategorySerializer


class IsSuperAdminUser(permissions.BasePermission):
    """
    Permission class that grants access only to superadmin users.
    """
    message = "Access denied. Only superadmin is allowed."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_superuser
        )


class CategoryListCreateView(APIView):
    """Async API for superadmin to list and create categories."""
    permission_classes = [IsSuperAdminUser]

    async def get(self, request):
        if not (request.user and request.user.is_superuser):
            return Response(
                {"error": "Access denied. Only superadmin is allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        status_param = request.query_params.get("status")
        search_query = request.query_params.get("search")

        @sync_to_async
        def _get_categories():
            qs = Category.objects.all().order_by("-created_at")
            if status_param == "active":
                qs = qs.filter(is_active=True)
            elif status_param == "inactive":
                qs = qs.filter(is_active=False)

            if search_query:
                qs = qs.filter(name__icontains=search_query.strip())
            return CategorySerializer(list(qs), many=True).data

        data = await _get_categories()
        return Response(data, status=status.HTTP_200_OK)

    async def post(self, request):
        if not (request.user and request.user.is_superuser):
            return Response(
                {"error": "Access denied. Only superadmin is allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        @sync_to_async
        def _create_category():
            serializer = CategorySerializer(data=request.data)
            if not serializer.is_valid():
                return None, serializer.errors
            category = serializer.save()
            return CategorySerializer(category).data, None

        data, errors = await _create_category()
        if errors is not None:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)


class CategoryDetailView(APIView):
    """Async API for superadmin to retrieve, update, toggle or delete a category."""
    permission_classes = [IsSuperAdminUser]

    async def get(self, request, pk):
        if not (request.user and request.user.is_superuser):
            return Response(
                {"error": "Access denied. Only superadmin is allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        @sync_to_async
        def _get_category():
            try:
                category = Category.objects.get(pk=pk)
                return CategorySerializer(category).data, None
            except Category.DoesNotExist:
                return None, {"error": "Category not found."}

        data, error = await _get_category()
        if error:
            return Response(error, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    async def patch(self, request, pk):
        if not (request.user and request.user.is_superuser):
            return Response(
                {"error": "Access denied. Only superadmin is allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        @sync_to_async
        def _update_category():
            try:
                category = Category.objects.get(pk=pk)
            except Category.DoesNotExist:
                return None, {"error": "Category not found."}, 404

            serializer = CategorySerializer(category, data=request.data, partial=True)
            if not serializer.is_valid():
                return None, serializer.errors, 400
            updated = serializer.save()
            return CategorySerializer(updated).data, None, 200

        data, errors, code = await _update_category()
        if errors is not None:
            return Response(errors, status=code)
        return Response(data, status=code)

    async def delete(self, request, pk):
        if not (request.user and request.user.is_superuser):
            return Response(
                {"error": "Access denied. Only superadmin is allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        @sync_to_async
        def _delete_category():
            try:
                category = Category.objects.get(pk=pk)
                category.delete()
                return True
            except Category.DoesNotExist:
                return False

        deleted = await _delete_category()
        if not deleted:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"message": "Category deleted successfully."}, status=status.HTTP_200_OK)
        
import logging

from django.conf import settings
from django.db import models, transaction
from asgiref.sync import sync_to_async
from adrf.decorators import api_view
from rest_framework.decorators import parser_classes, permission_classes
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import VendorProfile
from .models import Product, ProductImage
from .serializers import (
    MAX_IMAGE_SIZE,
    ProductCreateSerializer,
    ProductImageSerializer,
    ProductOwnerSerializer,
    ProductUpdateSerializer,
)

logger = logging.getLogger(__name__)

MAX_GALLERY_IMAGES = 6


async def get_approved_vendor(user):
    # adjust "user" and "status" to your VendorProfile field names
    return await VendorProfile.objects.filter(user=user, status="approved").afirst()


def validate_gallery(files):
    """Check every gallery file BEFORE anything is saved. Returns (files, error_message)."""
    if len(files) > MAX_GALLERY_IMAGES:
        return None, f"You can upload up to {MAX_GALLERY_IMAGES} gallery images."
    for f in files:
        if f.size > MAX_IMAGE_SIZE:
            return None, f"{f.name}: image must be under 5 MB."
        check = ProductImageSerializer(data={"image": f})  # also confirms it is a real image
        if not check.is_valid():
            err_msg = check.errors.get("image", ["Invalid image file"])[0]
            return None, f"{f.name}: {err_msg}"
    return files, None


@transaction.atomic
def save_product(serializer, vendor, gallery_files):
    product = serializer.save(vendor=vendor)
    for f in gallery_files:
        ProductImage.objects.create(product=product, image=f)
    return product


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, JSONParser])
async def products_view(request):
    """
    GET: List products with filters (for superadmin, staff, or vendor).
    POST: Create a product (superadmin must select a vendor, vendor creates for their approved profile).
    """
    if request.method == "GET":
        try:
            user = request.user

            def fetch_list():
                qs = (
                    Product.objects.select_related("vendor", "category")
                    .prefetch_related("images")
                    .all()
                    .order_by("-created_at")
                )
                if not (user.is_superuser or user.is_staff):
                    try:
                        vendor = VendorProfile.objects.filter(user=user, status="approved").first()
                        if not vendor:
                            return []
                        qs = qs.filter(vendor=vendor)
                    except Exception:
                        return []

                status_param = request.query_params.get("status")
                if status_param and status_param != "all":
                    qs = qs.filter(status=status_param)

                search_query = request.query_params.get("search")
                if search_query:
                    clean_search = search_query.strip()
                    qs = qs.filter(
                        models.Q(name__icontains=clean_search)
                        | models.Q(sku__icontains=clean_search)
                        | models.Q(brand__icontains=clean_search)
                        | models.Q(category__name__icontains=clean_search)
                    )

                category_id = request.query_params.get("category_id")
                if category_id:
                    qs = qs.filter(category_id=category_id)

                return ProductOwnerSerializer(list(qs), many=True, context={"request": request}).data

            data = await sync_to_async(fetch_list)()
            return Response(data, status=200)

        except Exception as e:
            logger.exception("fetch_products failed: %s", e)
            return Response(
                {"success": False, "message": "Failed to fetch products.", "error": str(e) if settings.DEBUG else None},
                status=500,
            )

    # POST (create product)
    try:
        user = request.user

        if user.is_superuser or user.is_staff:
            # Superadmin / staff MUST select an approved vendor
            vendor_id = request.data.get("vendor_id")
            if not vendor_id:
                return Response(
                    {"success": False, "errors": {"vendor_id": ["Please select a vendor for this product."]}},
                    status=400,
                )
            vendor = await VendorProfile.objects.filter(pk=vendor_id, status="approved").afirst()
            if vendor is None:
                return Response(
                    {"success": False, "errors": {"vendor_id": ["Selected vendor was not found or is not approved."]}},
                    status=404,
                )
        else:
            # Vendor: always their own approved profile, never taken from body
            vendor = await get_approved_vendor(user)
            if vendor is None:
                return Response({"success": False, "message": "Only approved vendors can add products."}, status=403)

        serializer = ProductCreateSerializer(data=request.data)
        if not await sync_to_async(serializer.is_valid)():
            return Response({"success": False, "errors": serializer.errors}, status=400)

        gallery_files, gallery_error = await sync_to_async(validate_gallery)(
            request.FILES.getlist("gallery_images")
        )
        if gallery_error:
            return Response({"success": False, "errors": {"gallery_images": gallery_error}}, status=400)

        product = await sync_to_async(save_product)(serializer, vendor, gallery_files)

        def build_output():
            fresh = (
                Product.objects.select_related("vendor", "category")
                .prefetch_related("images")
                .get(pk=product.pk)
            )
            return ProductOwnerSerializer(fresh, context={"request": request}).data

        data = await sync_to_async(build_output)()
        return Response({"success": True, "message": "Product created successfully.", "data": data}, status=201)

    except Exception as e:
        logger.exception("create_product failed: %s", e)
        response_body = {"success": False, "message": "Something went wrong while creating the product."}
        if settings.DEBUG:
            response_body["error"] = str(e)
        return Response(response_body, status=500)


# Backward compatibility alias
create_product = products_view


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, JSONParser])
async def product_detail_view(request, pk):
    """
    GET    /store/products/<pk>/  — Retrieve a single product.
    PATCH  /store/products/<pk>/  — Update a product (vendor can update their own; superadmin can update any).
    DELETE /store/products/<pk>/  — Delete a product (vendor can delete their own; superadmin can delete any).
    """
    user = request.user

    # ------------------------------------------------------------------ helpers
    def _get_product():
        try:
            return (
                Product.objects.select_related("vendor", "category")
                .prefetch_related("images")
                .get(pk=pk)
            ), None
        except Product.DoesNotExist:
            return None, {"error": "Product not found."}

    def _has_product_access(product):
        """Return True if the requesting user may read/modify this product."""
        if user.is_superuser or user.is_staff:
            return True
        # Vendor: may only touch their own products
        vendor = VendorProfile.objects.filter(user=user, status="approved").first()
        if vendor and product.vendor_id == vendor.pk:
            return True
        return False

    # ------------------------------------------------------------------ GET
    if request.method == "GET":
        try:
            def _fetch():
                product, err = _get_product()
                if err:
                    return None, err
                if not _has_product_access(product):
                    return None, {"error": "You do not have permission to view this product."}
                return ProductOwnerSerializer(product, context={"request": request}).data, None

            data, err = await sync_to_async(_fetch)()
            if err:
                code = 404 if "not found" in err.get("error", "") else 403
                return Response(err, status=code)
            return Response(data, status=200)
        except Exception as e:
            logger.exception("product_detail GET failed: %s", e)
            return Response({"error": str(e) if settings.DEBUG else "Failed to fetch product."}, status=500)

    # ------------------------------------------------------------------ PATCH (update)
    if request.method == "PATCH":
        try:
            def _update():
                product, err = _get_product()
                if err:
                    return None, err, 404

                if not _has_product_access(product):
                    return None, {"error": "You do not have permission to update this product."}, 403

                # Superadmin can also reassign vendor
                extra = {}
                if user.is_superuser or user.is_staff:
                    new_vendor_id = request.data.get("vendor_id")
                    if new_vendor_id:
                        try:
                            new_vendor = VendorProfile.objects.get(pk=new_vendor_id, status="approved")
                            extra["vendor"] = new_vendor
                        except VendorProfile.DoesNotExist:
                            return None, {"errors": {"vendor_id": ["Selected vendor not found or not approved."]}}, 404

                serializer = ProductUpdateSerializer(product, data=request.data, partial=True)
                if not serializer.is_valid():
                    return None, {"errors": serializer.errors}, 400

                updated = serializer.save(**extra)

                # Handle gallery: delete removed images, add new ones
                remove_ids = request.data.getlist("remove_image_ids") or request.data.getlist("remove_image_ids[]")
                if remove_ids:
                    product.images.filter(pk__in=remove_ids).delete()

                gallery_files = request.FILES.getlist("gallery_images")
                if gallery_files:
                    existing_count = product.images.count()
                    if existing_count + len(gallery_files) > MAX_GALLERY_IMAGES:
                        return None, {
                            "errors": {
                                "gallery_images": f"Max {MAX_GALLERY_IMAGES} gallery images. Currently {existing_count}, trying to add {len(gallery_files)}."
                            }
                        }, 400
                    for f in gallery_files:
                        if f.size > MAX_IMAGE_SIZE:
                            return None, {"errors": {"gallery_images": f"{f.name}: image must be under 5 MB."}}, 400
                        ProductImage.objects.create(product=updated, image=f)

                # Re-fetch with fresh relations
                fresh = (
                    Product.objects.select_related("vendor", "category")
                    .prefetch_related("images")
                    .get(pk=updated.pk)
                )
                return ProductOwnerSerializer(fresh, context={"request": request}).data, None, 200

            data, err, code = await sync_to_async(_update)()
            if err:
                return Response(err, status=code)
            return Response({"success": True, "message": "Product updated successfully.", "data": data}, status=200)

        except Exception as e:
            logger.exception("product_detail PATCH failed: %s", e)
            body = {"success": False, "message": "Something went wrong while updating the product."}
            if settings.DEBUG:
                body["error"] = str(e)
            return Response(body, status=500)

    # ------------------------------------------------------------------ DELETE
    if request.method == "DELETE":
        try:
            def _delete():
                product, err = _get_product()
                if err:
                    return False, err, 404
                if not _has_product_access(product):
                    return False, {"error": "You do not have permission to delete this product."}, 403
                product.delete()
                return True, None, 200

            ok, err, code = await sync_to_async(_delete)()
            if err:
                return Response(err, status=code)
            return Response({"success": True, "message": "Product deleted successfully."}, status=200)

        except Exception as e:
            logger.exception("product_detail DELETE failed: %s", e)
            body = {"success": False, "message": "Something went wrong while deleting the product."}
            if settings.DEBUG:
                body["error"] = str(e)
            return Response(body, status=500)

