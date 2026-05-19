FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache nginx supervisor postgresql-dev libpq curl \
    && docker-php-ext-install pdo pdo_pgsql opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json ./
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

COPY . .

RUN mkdir -p storage/framework/{cache,sessions,views} \
             storage/logs \
             bootstrap/cache \
    && cp .env.example .env 2>/dev/null || true \
    && php artisan config:clear 2>/dev/null || true \
    && php artisan package:discover --ansi 2>/dev/null || true \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf  /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

EXPOSE 8082
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
