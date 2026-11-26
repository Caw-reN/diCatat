# =====================================================================
# STAGE 1: Build Frontend React (Vite)
# =====================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build/app-react
COPY app-react/package*.json ./
RUN npm install
COPY app-react/ ./
RUN npm run build

# =====================================================================
# STAGE 2: Production Container (PHP 8.3-FPM + Nginx + Laravel + React)
# =====================================================================
FROM php:8.3-fpm-alpine

# Install system dependencies, Nginx, and PHP extensions
RUN apk add --no-cache \
    nginx \
    curl \
    git \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl

# Increase PHP upload limit to 20MB for receipt photos
RUN echo "upload_max_filesize = 20M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/dicatat

# Copy & install Laravel Backend
COPY backend-laravel/ /var/www/dicatat/backend-laravel/
WORKDIR /var/www/dicatat/backend-laravel
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction

# Copy compiled React Frontend from Stage 1
COPY --from=frontend-builder /build/app-react/dist /var/www/dicatat/app-react/dist

# Configure Nginx & Entrypoint
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

# Permissions for Laravel storage
RUN chown -R www-data:www-data /var/www/dicatat/backend-laravel/storage /var/www/dicatat/backend-laravel/bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
