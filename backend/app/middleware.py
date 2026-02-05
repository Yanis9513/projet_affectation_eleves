"""
Middleware pour le logging des requetes HTTP.
"""
import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configuration du logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('api')


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware pour logger les requetes HTTP."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Obtenir les infos de la requete
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else 'unknown'
        
        # Log de debut
        logger.info(f"→ {method} {path} from {client_ip}")
        
        try:
            response = await call_next(request)
            
            # Calculer le temps de traitement
            process_time = (time.time() - start_time) * 1000  # en ms
            
            # Log de fin
            status = response.status_code
            status_emoji = '✓' if status < 400 else '✗'
            logger.info(f"← {status_emoji} {method} {path} - {status} ({process_time:.2f}ms)")
            
            # Ajouter le header du temps de traitement
            response.headers['X-Process-Time'] = f"{process_time:.2f}ms"
            
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(f"✗ {method} {path} - Error: {str(e)} ({process_time:.2f}ms)")
            raise


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware simple pour limiter le nombre de requetes."""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}  # IP -> [(timestamp, count)]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else 'unknown'
        current_time = time.time()
        
        # Nettoyer les anciennes entrees
        if client_ip in self.requests:
            self.requests[client_ip] = [
                (ts, count) for ts, count in self.requests[client_ip]
                if current_time - ts < self.window_seconds
            ]
        
        # Compter les requetes dans la fenetre
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        request_count = sum(count for _, count in self.requests[client_ip])
        
        if request_count >= self.max_requests:
            return Response(
                content='{"detail": "Trop de requetes. Veuillez reessayer plus tard."}',
                status_code=429,
                media_type='application/json'
            )
        
        # Ajouter la requete actuelle
        self.requests[client_ip].append((current_time, 1))
        
        return await call_next(request)


def setup_logging(level: str = 'INFO'):
    """Configure le logging global."""
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    # Logger principal
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Reduire le bruit des bibliotheques tierces
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    return logger
