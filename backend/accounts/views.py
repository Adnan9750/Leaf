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
from .emails import send_vendor_approval_email, send_vendor_rejection_email
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

def _process_vendor_status_change(vendor, new_status, rejection_reason=None):
    clean_status = new_status.strip().lower()
    vendor.status = clean_status
    email_sent = False
    email_message = ""

    if clean_status == VendorProfile.Status.APPROVED:
        vendor.user.is_active = True
        vendor.rejection_reason = ""
        vendor.user.save()
        vendor.save()
        email_sent, email_message = send_vendor_approval_email(vendor)

    elif clean_status == VendorProfile.Status.REJECTED:
        vendor.user.is_active = False
        vendor.rejection_reason = (rejection_reason or "Your application did not meet our verification criteria.").strip()
        vendor.user.save()
        vendor.save()
        email_sent, email_message = send_vendor_rejection_email(vendor, vendor.rejection_reason)

    elif clean_status == VendorProfile.Status.PENDING:
        vendor.user.is_active = False
        vendor.user.save()
        vendor.save()

    data = VendorProfileSerializer(vendor).data
    return data, email_sent, email_message


@api_view(["PATCH", "PUT", "POST"])
@permission_classes([IsAuthenticated])
async def vendor_status_update_view(request, vendor_id):
    """
    Vendor Status Update API (Async with ADRF):
    - Approves or rejects a vendor profile and updates user.is_active.
    - Sends an email on approval or rejection with reason attached.
    """
    if not (request.user.is_superuser or request.user.is_staff):
        return Response(
            {"error": "Only administrators can update vendor status."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        vendor = await VendorProfile.objects.select_related("user").aget(id=vendor_id)
    except VendorProfile.DoesNotExist:
        return Response({"error": "Vendor not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    valid_statuses = [choice[0] for choice in VendorProfile.Status.choices]

    if not new_status or new_status.strip().lower() not in valid_statuses:
        return Response(
            {
                "error": f"Invalid status '{new_status}'. Valid options are: {', '.join(valid_statuses)}."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    clean_status = new_status.strip().lower()
    rejection_reason = request.data.get("rejection_reason") or request.data.get("reason")

    data, email_sent, email_message = await sync_to_async(_process_vendor_status_change)(
        vendor, clean_status, rejection_reason
    )

    response_payload = {
        **data,
        "message": f"Vendor status successfully updated to '{clean_status}'.",
        "email_sent": email_sent,
        "email_message": email_message,
    }
    return Response(response_payload, status=status.HTTP_200_OK)


@api_view(["POST", "PATCH"])
@permission_classes([IsAuthenticated])
async def vendor_approve_view(request, vendor_id):
    """
    Dedicated Vendor Approval API:
    - Sets vendor status to 'approved' and user.is_active=True.
    - Sends a personalized approval email to the vendor.
    """
    if not (request.user.is_superuser or request.user.is_staff):
        return Response(
            {"error": "Only administrators can approve vendors."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        vendor = await VendorProfile.objects.select_related("user").aget(id=vendor_id)
    except VendorProfile.DoesNotExist:
        return Response({"error": "Vendor not found."}, status=status.HTTP_404_NOT_FOUND)

    data, email_sent, email_message = await sync_to_async(_process_vendor_status_change)(
        vendor, VendorProfile.Status.APPROVED
    )

    return Response(
        {
            **data,
            "message": "Vendor approved successfully and confirmation email sent.",
            "email_sent": email_sent,
            "email_message": email_message,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST", "PATCH"])
@permission_classes([IsAuthenticated])
async def vendor_reject_view(request, vendor_id):
    """
    Dedicated Vendor Rejection API:
    - Sets vendor status to 'rejected' and user.is_active=False.
    - Attaches rejection reason to the vendor record.
    - Sends a rejection email with the specific reason to the vendor.
    """
    if not (request.user.is_superuser or request.user.is_staff):
        return Response(
            {"error": "Only administrators can reject vendors."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        vendor = await VendorProfile.objects.select_related("user").aget(id=vendor_id)
    except VendorProfile.DoesNotExist:
        return Response({"error": "Vendor not found."}, status=status.HTTP_404_NOT_FOUND)

    rejection_reason = request.data.get("rejection_reason") or request.data.get("reason")
    if not rejection_reason or not rejection_reason.strip():
        return Response(
            {"error": "Please provide a rejection reason explaining why the application was rejected."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data, email_sent, email_message = await sync_to_async(_process_vendor_status_change)(
        vendor, VendorProfile.Status.REJECTED, rejection_reason
    )

    return Response(
        {
            **data,
            "message": "Vendor rejected successfully and rejection reason email sent.",
            "email_sent": email_sent,
            "email_message": email_message,
        },
        status=status.HTTP_200_OK,
    )


