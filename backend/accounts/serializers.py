from rest_framework import serializers
from django.db import transaction
from .models import User,VendorProfile


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


class VendorSignupSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        max_length=100,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "First name is required.",
            "blank": "First name is required.",
        },
    )
    last_name = serializers.CharField(
        max_length=100,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Last name is required.",
            "blank": "Last name is required.",
        },
    )
    email = serializers.EmailField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Email address is required.",
            "blank": "Email address is required.",
            "invalid": "Please enter a valid email address.",
        },
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True,
        error_messages={
            "required": "Password is required.",
            "blank": "Password is required.",
            "min_length": "Password must be at least 8 characters long.",
        },
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": "Confirm password is required.",
            "blank": "Confirm password is required.",
        },
    )
    company_name = serializers.CharField(
        write_only=True,
        max_length=255,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Company / Store name is required.",
            "blank": "Company / Store name is required.",
        },
    )
    phone_number = serializers.CharField(
        write_only=True,
        max_length=15,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Phone number is required.",
            "blank": "Phone number is required.",
        },
    )
    city = serializers.CharField(
        write_only=True,
        max_length=100,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "City is required.",
            "blank": "City is required.",
        },
    )
    address = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Address is required.",
            "blank": "Address is required.",
        },
    )

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
            "company_name",
            "phone_number",
            "city",
            "address",
        ]

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Email is already registered.")
        return normalized

    def validate_company_name(self, value):
        trimmed = value.strip()
        if VendorProfile.objects.filter(company_name__iexact=trimmed).exists():
            raise serializers.ValidationError("Company name is already registered.")
        return trimmed

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # Remove fields that belong to VendorProfile
        confirm_password = validated_data.pop("confirm_password", None)
        company_name = validated_data.pop("company_name")
        phone_number = validated_data.pop("phone_number")
        city = validated_data.pop("city")
        address = validated_data.pop("address")
        password = validated_data.pop("password")

        # 1. Create User
        user = User.objects.create_user(
            email=validated_data["email"],
            password=password,
            first_name=validated_data["first_name"].strip(),
            last_name=validated_data["last_name"].strip(),
            is_active=False,
        )

        # 2. Create VendorProfile
        VendorProfile.objects.create(
            user=user,
            company_name=company_name,
            phone_number=phone_number,
            city=city,
            address=address,
            status=VendorProfile.Status.PENDING,
        )

        return user

