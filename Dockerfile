FROM php:8.2-cli-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    sqlite-dev \
    && docker-php-ext-install pdo_mysql pdo_sqlite mbstring bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend application files
# Git tracks this folder as 'Backend' (capital B) — preserved for Linux checkout compatibility
COPY Backend/ .

# Ensure storage, cache, and database directories exist with correct permissions
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views \
        storage/logs bootstrap/cache public/uploads/products database \
    && chmod -R 777 storage bootstrap/cache public/uploads database

# Install PHP dependencies (no dev, optimised autoloader)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Render assigns a dynamic PORT; default to 10000
ENV PORT=10000
ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 10000

# Startup: clear cached config so env-vars from Render are picked up,
# run migrations (safe — only creates tables that don't exist),
# then launch the built-in PHP server on the assigned port.
CMD ["sh", "-c", \
  "php artisan config:clear && \
   php artisan migrate --force --no-interaction 2>/dev/null || true && \
   php artisan db:seed --force --no-interaction 2>/dev/null || true && \
   php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
