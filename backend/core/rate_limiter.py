from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

from core.security import decode_access_token


def get_rate_limit_key(request: Request) -> str:
    """
    Rate limit by authenticated user id when a valid token is present,
    falling back to IP address for unauthenticated requests (login,
    register - the exact endpoints most likely to be brute-forced, and
    the ones with no user id to key on yet).
    """
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ")
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            return f"user:{payload['sub']}"

    return get_remote_address(request)


limiter = Limiter(key_func=get_rate_limit_key)