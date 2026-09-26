import json
from asgiref.sync import sync_to_async
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, VendorProfile
from .serializers import VendorProfileSerializer, VendorSignupSerializer
from .utils import set_auth_cookies, clear_auth_cookies
from adrf.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes

# Create your views here.
def user_to_dict(user):
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_superuser": user.is_superuser,
    }


@csrf_exempt
async def signup_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    @sync_to_async
    def _validate_and_save():
        serializer = VendorSignupSerializer(data=data)
        if not serializer.is_valid():
            return None, serializer.errors
        user = serializer.save()
        return user, None

    user, errors = await _validate_and_save()
    if errors is not None:
        return JsonResponse(errors, status=400)

    return JsonResponse(
        {"message": "Signup successful. Wait for admin approval.", "email": user.email},
        status=201,
    )


@csrf_exempt
async def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return JsonResponse({"error": "Email and password are required"}, status=400)

    user = await User.objects.filter(email__iexact=email).afirst()
 
    if not user or not await user.acheck_password(password):
        return JsonResponse({"error": "Invalid email or password"}, status=401)

    if not user.is_superuser and not user.is_active:
        return JsonResponse(
            {"error": "Account not approved yet. Wait for admin approval."},
            status=403,
        )

    refresh = await sync_to_async(RefreshToken.for_user)(user)

    response = JsonResponse({"user": user_to_dict(user)})   # token body me nahi
    set_auth_cookies(response, str(refresh.access_token), str(refresh))
    return response


@csrf_exempt
async def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    raw = request.COOKIES.get(settings.REFRESH_COOKIE)
    if raw:
        try:
            await sync_to_async(lambda: RefreshToken(raw).blacklist())()
        except TokenError:
            pass

    response = JsonResponse({"detail": "Logged out"})
    clear_auth_cookies(response)
    return response


def _rotate(raw):
    ser = TokenRefreshSerializer(data={"refresh": raw})
    ser.is_valid(raise_exception=True)
    return ser.validated_data


@csrf_exempt
async def refresh_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    raw = request.COOKIES.get(settings.REFRESH_COOKIE)
    if not raw:
        return JsonResponse({"error": "No refresh token"}, status=401)

    try:
        data = await sync_to_async(_rotate)(raw)
    except TokenError:
        response = JsonResponse({"error": "Invalid refresh token"}, status=401)
        clear_auth_cookies(response)
        return response

    response = JsonResponse({"detail": "ok"})
    set_auth_cookies(response, data["access"], data.get("refresh"))
    return response

#     ser = TokenRefreshSerializer(data={"refresh": raw})
#     ser.is_valid(raise_exception=True)
#     return ser.validated_data


# @csrf_exempt
# async def refresh_view(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Method not allowed"}, status=405)

#     raw = request.COOKIES.get(settings.REFRESH_COOKIE)
#     if not raw:
#         return JsonResponse({"error": "No refresh token"}, status=401)

#     try:
#         data = await sync_to_async(_rotate)(raw)
#     except TokenError:
#         response = JsonResponse({"error": "Invalid refresh token"}, status=401)
#         clear_auth_cookies(response)
#         return response

#     response = JsonResponse({"detail": "ok"})
#     set_auth_cookies(response, data["access"], data.get("refresh"))
#     return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
async def vendor_list_view(request):
    """
    Vendor List API (Async with ADRF):
    - Supports JWT authentication (via HttpOnly cookies or Bearer header).
    - Accepts optional query parameter: `?status=pending|approved|rejected|all`.
    """
    status_param = request.query_params.get("status")

    queryset = VendorProfile.objects.select_related("user").all().order_by("-created_at")

    if status_param and status_param.strip().lower() != "all":
        clean_status = status_param.strip().lower()
        valid_statuses = [choice[0] for choice in VendorProfile.Status.choices]

        if clean_status not in valid_statuses:
            return Response(
                {
                    "error": f"Invalid status '{status_param}'. Valid options are: {', '.join(valid_statuses)} (or 'all')."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        queryset = queryset.filter(status=clean_status)

    vendors = [vendor async for vendor in queryset]
    serializer = VendorProfileSerializer(vendors, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
