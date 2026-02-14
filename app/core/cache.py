"""
Centralized in-memory cache manager using cachetools.

Provides TTL-based caching for frequently accessed, rarely-changing data
like products and categories. Each cache is a separate TTLCache instance
with configurable maxsize and TTL.

Usage:
    from app.core.cache import cache_manager

    # Get from cache or None
    data = cache_manager.get("products", cache_key)

    # Set in cache
    cache_manager.set("products", cache_key, data)

    # Invalidate a specific namespace (e.g. on product update)
    cache_manager.invalidate("products")
"""

from cachetools import TTLCache
import threading
import logging

logger = logging.getLogger(__name__)


class CacheManager:
    """Thread-safe in-memory cache manager with namespaced TTL caches."""

    def __init__(self):
        self._lock = threading.Lock()
        self._caches: dict[str, TTLCache] = {}

        # Define cache configurations: namespace -> (maxsize, ttl_seconds)
        self._configs = {
            "products_list": (128, 300),    # 128 entries, 5 min TTL
            "product_detail": (256, 300),   # 256 entries, 5 min TTL
            "categories": (1, 1800),        # 1 entry, 30 min TTL
        }

        # Initialize caches
        for name, (maxsize, ttl) in self._configs.items():
            self._caches[name] = TTLCache(maxsize=maxsize, ttl=ttl)

    def get(self, namespace: str, key: str):
        """Get a value from cache. Returns None on miss."""
        cache = self._caches.get(namespace)
        if cache is None:
            return None
        with self._lock:
            value = cache.get(key)
            if value is not None:
                logger.debug(f"CACHE HIT: {namespace}:{key}")
            return value

    def set(self, namespace: str, key: str, value):
        """Set a value in cache."""
        cache = self._caches.get(namespace)
        if cache is None:
            return
        with self._lock:
            cache[key] = value
            logger.debug(f"CACHE SET: {namespace}:{key}")

    def invalidate(self, namespace: str):
        """Clear all entries in a namespace."""
        cache = self._caches.get(namespace)
        if cache is None:
            return
        with self._lock:
            cache.clear()
            logger.info(f"CACHE INVALIDATED: {namespace}")

    def invalidate_key(self, namespace: str, key: str):
        """Remove a specific key from a namespace."""
        cache = self._caches.get(namespace)
        if cache is None:
            return
        with self._lock:
            cache.pop(key, None)
            logger.debug(f"CACHE KEY REMOVED: {namespace}:{key}")

    def invalidate_all(self):
        """Clear all caches."""
        with self._lock:
            for cache in self._caches.values():
                cache.clear()
            logger.info("ALL CACHES INVALIDATED")

    def stats(self) -> dict:
        """Get cache stats for monitoring."""
        with self._lock:
            return {
                name: {
                    "size": len(cache),
                    "maxsize": cache.maxsize,
                    "ttl": cache.ttl,
                }
                for name, cache in self._caches.items()
            }


# Singleton instance
cache_manager = CacheManager()
