from adrf.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from asgiref.sync import sync_to_async
from .models import Category
from .serializers import CategorySerializer


class CategoryListCreateView(APIView):
    """Async API for superadmin to list and create categories."""
    permission_classes = [permissions.IsAuthenticated]

    async def get(self, request):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {"error": "Only administrators can access categories."},
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
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {"error": "Only superadmin can create categories."},
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
    permission_classes = [permissions.IsAuthenticated]

    async def get(self, request, pk):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {"error": "Only administrators can access category details."},
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
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {"error": "Only superadmin can update categories."},
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
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {"error": "Only superadmin can delete categories."},
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
