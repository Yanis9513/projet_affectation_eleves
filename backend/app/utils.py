"""
Utilitaires communs pour l'application.
"""
from typing import Any, Dict, List, Optional, TypeVar
from datetime import datetime, date
from functools import wraps
import hashlib
import secrets
import string


T = TypeVar('T')


def generate_random_string(length: int = 32) -> str:
    """Genere une chaine aleatoire securisee."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_token(length: int = 64) -> str:
    """Genere un token securise."""
    return secrets.token_urlsafe(length)


def hash_string(value: str) -> str:
    """Hash une chaine avec SHA-256."""
    return hashlib.sha256(value.encode()).hexdigest()


def safe_get(data: Dict, *keys, default: Any = None) -> Any:
    """Recupere une valeur imbriquee en toute securite."""
    result = data
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key, default)
        elif isinstance(result, list) and isinstance(key, int):
            try:
                result = result[key]
            except IndexError:
                return default
        else:
            return default
    return result


def chunk_list(lst: List[T], chunk_size: int) -> List[List[T]]:
    """Divise une liste en morceaux de taille donnee."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def flatten_list(nested_list: List[List[T]]) -> List[T]:
    """Aplatit une liste imbriquee."""
    return [item for sublist in nested_list for item in sublist]


def unique_list(lst: List[T]) -> List[T]:
    """Supprime les doublons tout en preservant l'ordre."""
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def format_date(d: Optional[date], format: str = "%d/%m/%Y") -> str:
    """Formate une date."""
    if not d:
        return ""
    return d.strftime(format)


def format_datetime(dt: Optional[datetime], format: str = "%d/%m/%Y %H:%M") -> str:
    """Formate une datetime."""
    if not dt:
        return ""
    return dt.strftime(format)


def parse_date(date_str: str, formats: List[str] = None) -> Optional[date]:
    """Parse une date depuis differents formats."""
    if not date_str:
        return None
    
    if formats is None:
        formats = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    
    return None


def truncate_string(s: str, max_length: int = 100, suffix: str = "...") -> str:
    """Tronque une chaine de caracteres."""
    if not s or len(s) <= max_length:
        return s
    return s[:max_length - len(suffix)] + suffix


def sanitize_filename(filename: str) -> str:
    """Nettoie un nom de fichier."""
    # Caracteres interdits sur la plupart des systemes
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename.strip()


def calculate_percentage(part: float, total: float, decimals: int = 1) -> float:
    """Calcule un pourcentage."""
    if total == 0:
        return 0.0
    return round((part / total) * 100, decimals)


def group_by(items: List[Dict], key: str) -> Dict[Any, List[Dict]]:
    """Groupe une liste de dicts par une cle."""
    result = {}
    for item in items:
        k = item.get(key)
        if k not in result:
            result[k] = []
        result[k].append(item)
    return result


def sort_by_key(items: List[Dict], key: str, reverse: bool = False) -> List[Dict]:
    """Trie une liste de dicts par une cle."""
    return sorted(items, key=lambda x: x.get(key, ''), reverse=reverse)


def filter_none(d: Dict) -> Dict:
    """Supprime les valeurs None d'un dict."""
    return {k: v for k, v in d.items() if v is not None}


def merge_dicts(*dicts: Dict) -> Dict:
    """Fusionne plusieurs dicts."""
    result = {}
    for d in dicts:
        result.update(d)
    return result


class Singleton:
    """Metaclass pour creer des singletons."""
    _instances = {}
    
    def __new__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__new__(cls)
        return cls._instances[cls]


def retry(max_attempts: int = 3, delay: float = 1.0, exceptions: tuple = (Exception,)):
    """Decorateur pour reessayer une fonction en cas d'erreur."""
    import time
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        time.sleep(delay * (attempt + 1))
            raise last_exception
        return wrapper
    return decorator


def memoize(func):
    """Decorateur pour mettre en cache les resultats d'une fonction."""
    cache = {}
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        key = str(args) + str(sorted(kwargs.items()))
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        return cache[key]
    
    wrapper.cache_clear = lambda: cache.clear()
    return wrapper
