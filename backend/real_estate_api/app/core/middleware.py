from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
import secrets
from typing import Dict, List, Optional
import asyncio

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        rate_limit_per_minute: int = 60,
        exclude_paths: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.rate_limit = rate_limit_per_minute
        self.exclude_paths = exclude_paths or []
        self.request_counts: Dict[str, List[float]] = {}
        
        self.cleanup_task = asyncio.create_task(self._cleanup_old_requests())
    
    async def _cleanup_old_requests(self):
        while True:
            await asyncio.sleep(60)  # Run every minute
            current_time = time.time()
            for ip, timestamps in list(self.request_counts.items()):
                self.request_counts[ip] = [ts for ts in timestamps if current_time - ts < 60]
                if not self.request_counts[ip]:
                    del self.request_counts[ip]
    
    async def dispatch(self, request: Request, call_next):
        for path in self.exclude_paths:
            if request.url.path.startswith(path):
                return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []
        
        current_time = time.time()
        
        recent_requests = [ts for ts in self.request_counts[client_ip] if current_time - ts < 60]
        self.request_counts[client_ip] = recent_requests
        
        if len(recent_requests) >= self.rate_limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."}
            )
        
        self.request_counts[client_ip].append(current_time)
        
        return await call_next(request)

class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        csrf_token_header: str = "X-CSRF-Token",
        csrf_cookie_name: str = "csrf_token",
        exclude_methods: Optional[List[str]] = None,
        exclude_paths: Optional[List[str]] = None
    ):
        super().__init__(app)
        self.csrf_token_header = csrf_token_header
        self.csrf_cookie_name = csrf_cookie_name
        self.exclude_methods = exclude_methods or ["GET", "HEAD", "OPTIONS"]
        self.exclude_paths = exclude_paths or ["/api/auth/login", "/api/auth/register"]
    
    async def dispatch(self, request: Request, call_next):
        if request.method in self.exclude_methods:
            response = await call_next(request)
            if request.method == "GET" and self.csrf_cookie_name not in request.cookies:
                response.set_cookie(
                    key=self.csrf_cookie_name,
                    value=secrets.token_hex(32),
                    httponly=True,
                    samesite="strict",
                    secure=True  # Set to False for development without HTTPS
                )
            return response
        
        for path in self.exclude_paths:
            if request.url.path.startswith(path):
                return await call_next(request)
        
        csrf_cookie = request.cookies.get(self.csrf_cookie_name)
        csrf_header = request.headers.get(self.csrf_token_header)
        
        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF token missing or invalid"}
            )
        
        return await call_next(request)
