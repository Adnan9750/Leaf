from django.conf import settings

def _opts(max_age):
    return dict(httponly=True, secure=not settings.DEBUG, samesite="Lax", max_age=max_age, path="/")

def set_auth_cookies(response, access=None, refresh=None):
    if access:
        response.set_cookie(settings.ACCESS_COOKIE, access, **_opts(15 * 60))
    if refresh:
        response.set_cookie(settings.REFRESH_COOKIE, refresh, **_opts(7 * 24 * 3600))

def clear_auth_cookies(response):
    response.delete_cookie(settings.ACCESS_COOKIE, path="/")
    response.delete_cookie(settings.REFRESH_COOKIE, path="/")