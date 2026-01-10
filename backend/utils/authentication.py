from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication scheme that skips CSRF checks.
    This is often used for decoupled frontends during development.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check
