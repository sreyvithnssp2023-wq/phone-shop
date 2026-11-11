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
    && docker-php-ext-install pdo_mysql mbstring bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy Backend application files
COPY Backend/ .

# Ensure storage and cache directories exist with correct permissions
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache public/uploads/products \
    && chmod -R 775 storage bootstrap/cache public/uploads

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Default Render port is 10000, support concurrent requests
ENV PORT=10000
ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 10000

# Start Laravel using dynamic cloud port ($PORT)
CMD ["sh", "-c", "php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
