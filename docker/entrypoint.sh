#!/usr/bin/env sh
set -e

cd /var/www/dicatat/backend-laravel

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Update .env variables from Docker environment
sed -i "s|^APP_ENV=.*|APP_ENV=${APP_ENV:-production}|" .env
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=${APP_DEBUG:-false}|" .env
sed -i "s|^APP_URL=.*|APP_URL=${APP_URL:-http://localhost:8080}|" .env
sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=mysql|" .env
sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST:-mysql}|" .env
sed -i "s|^DB_PORT=.*|DB_PORT=${DB_PORT:-3306}|" .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE:-dicatat}|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME:-dicatat_user}|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD:-DicatatSecret2026!}|" .env

# Generate APP_KEY if empty
if ! grep -q "^APP_KEY=base64:" .env; then
  php artisan key:generate --force
fi

echo "⏳ Menunggu koneksi database MySQL (${DB_HOST:-mysql}:3306)..."
MAX_TRIES=30
COUNT=0
until php artisan db:monitor > /dev/null 2>&1 || [ $COUNT -eq $MAX_TRIES ]; do
  COUNT=$((COUNT + 1))
  echo "   Percobaan ke-${COUNT}/${MAX_TRIES}..."
  sleep 2
done

echo "🚀 Menjalankan migrasi & seeder database MySQL..."
php artisan migrate --seed --force
php artisan storage:link || true

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "🐾 Menjalankan PHP-FPM & Nginx pada Port 8080..."
php-fpm -D
exec nginx -g "daemon off;"
