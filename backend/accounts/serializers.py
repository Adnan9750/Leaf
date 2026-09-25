from rest_framework import serializers
from django.db import transaction
from .models import User, VendorProfile


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # User check karo
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "Invalid credentials."}
            )

        # Password check karo
        if not user.check_password(password):
            raise serializers.ValidationError(
                {"password": "Invalid credentials."}
            )

        # Superadmin ke liye alag check
        # is_active directly True hoga
        if user.is_superuser:
            attrs["user"] = user
            return attrs

        # Normal vendor ke liye active check
        if not user.is_active:
            raise serializers.ValidationError(
                {"email": "Account not approved yet. Wait for admin approval."}
            )

        attrs["user"] = user
        return attrs


class VendorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "date_joined",
        ]


class VendorProfileSerializer(serializers.ModelSerializer):
    user = VendorUserSerializer(read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = VendorProfile
        fields = [
            "id",
            "user_id",
            "user",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "company_name",
            "phone_number",
            "city",
            "address",
            "currency",
            "status",
            "rejection_reason",
            "created_at",
            "updated_at",
        ]