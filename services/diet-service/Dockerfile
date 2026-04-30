FROM php:8.3-fpm-alpine AS base
RUN apk add --no-cache nginx supervisor postgresql-dev libpq \
    && docker-php-ext-install pdo pdo_pgsql opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

COPY . .
RUN composer run-script post-autoload-dump \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf  /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

EXPOSE 8082
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
