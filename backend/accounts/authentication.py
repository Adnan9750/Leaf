from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw = request.COOKIES.get(settings.ACCESS_COOKIE)
        if not raw:
            header = self.get_header(request)
            if header is None:
                return None
            raw = self.get_raw_token(header)
            if raw is None:
                return None
        token = self.get_validated_token(raw)
        return self.get_user(token), token