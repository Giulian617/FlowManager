FROM redis:latest
# Run as root and ensure the mounted volume is writable, then start redis.
# (Passing "sh" as the arg makes the official entrypoint skip its gosu drop to the redis user.)
CMD ["sh", "-c", "chown -R redis:redis /data && exec redis-server --appendonly yes --dir /data"]
