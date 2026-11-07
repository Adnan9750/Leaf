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

from asgiref.sync import sync_to_async
from adrf.decorators import api_view
from django.db import transaction
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
            return None, f"{f.name}: {check.errors['image'][0]}"
    return files, None


@transaction.atomic
def save_product(serializer, vendor, gallery_files):
    product = serializer.save(vendor=vendor)
    for f in gallery_files:
        ProductImage.objects.create(product=product, image=f)
    return product


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, JSONParser])
async def create_product(request):
    """Create a product. JSON, or multipart with `image` (cover) and `gallery_images` (several files)."""
    try:
        user = request.user

        if user.is_superuser:
            # superadmin: store's own product (no vendor), or on behalf of a vendor
            vendor = None
            vendor_id = request.data.get("vendor_id")
            if vendor_id:
                vendor = await VendorProfile.objects.filter(pk=vendor_id).afirst()
                if vendor is None:
                    return Response({"success": False, "message": "Vendor not found."}, status=404)
        else:
            # vendor: always their own approved profile, never taken from the body
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

    except Exception:
        logger.exception("create_product failed")
        return Response({"success": False, "message": "Something went wrong while creating the product."}, status=500)



