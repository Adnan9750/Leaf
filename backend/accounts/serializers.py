from rest_framework import serializers
from django.db import transaction
from .models import User


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