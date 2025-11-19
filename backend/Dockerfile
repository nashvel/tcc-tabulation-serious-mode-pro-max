# Single-stage build with Apache
FROM php:8.2-apache-bullseye

# Install ALL dependencies (build + runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libpng16-16 \
    libzip-dev \
    libzip4 \
    libonig-dev \
    libonig5 \
    libsqlite3-dev \
    libsqlite3-0 \
    git \
    unzip \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install -j$(nproc) pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Get Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist

# Copy package files for npm
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Set up Laravel directories and environment first (v2 - fixed asset URLs)
RUN mkdir -p storage/framework/{sessions,views,cache/data} storage/logs bootstrap/cache \
    && cp .env.example .env \
    && sed -i 's/CACHE_STORE=database/CACHE_STORE=file/' .env \
    && sed -i 's/SESSION_DRIVER=database/SESSION_DRIVER=file/' .env \
    && sed -i 's/APP_DEBUG=false/APP_DEBUG=true/' .env \
    && sed -i 's/APP_ENV=local/APP_ENV=production/' .env \
    && sed -i 's|APP_URL=http://localhost|APP_URL=https://jspot.up.railway.app|' .env \
    && echo "ASSET_URL=https://jspot.up.railway.app" >> .env \
    && echo "VIEW_COMPILED_PATH=/var/www/html/storage/framework/views" >> .env \
    && echo "CACHE_PATH=/var/www/html/storage/framework/cache" >> .env \
    && echo "LOG_CHANNEL=stderr" >> .env \
    && touch storage/database.sqlite \
    && php artisan key:generate --force \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod 664 storage/database.sqlite

# Build assets and optimize
RUN npm run build \
    && echo "=== Build directory contents ===" \
    && ls -lah public/build/ \
    && echo "=== Manifest content ===" \
    && cat public/build/manifest.json \
    && echo "=== Cleaning up ===" \
    && rm -rf node_modules \
    && composer dump-autoload --optimize --no-dev --no-scripts

# Set proper permissions and cleanup
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache public/build \
    && chmod -R 755 public \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

# Configure Apache and PHP
COPY apache-site.conf /etc/apache2/sites-available/000-default.conf
COPY php.ini /usr/local/etc/php/conf.d/99-custom.ini

# Copy and setup entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables for Laravel
ENV CACHE_STORE=file
ENV SESSION_DRIVER=file
ENV CACHE_PATH=/var/www/html/storage/framework/cache
ENV VIEW_COMPILED_PATH=/var/www/html/storage/framework/views
ENV PORT=80

# Create PHP test file
RUN echo "<?php phpinfo(); ?>" > public/info.php

EXPOSE 80

# Use custom entrypoint that handles PORT variable
CMD ["/usr/local/bin/docker-entrypoint.sh"]
