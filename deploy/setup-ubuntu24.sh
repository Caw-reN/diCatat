#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🐾 Memulai Setup & Deployment Lokal diCatat (Ubuntu 24.04)"
echo "===================================================="

APP_DIR="/var/www/dicatat"
DB_NAME="dicatat"
DB_USER="dicatat_user"
DB_PASS="DicatatSecret2026!"

echo "[1/6] Menginstal paket sistem (Nginx, MySQL, PHP 8.3, Composer, Node.js 20)..."
sudo apt update
sudo apt install -y nginx mysql-server curl git unzip \
  php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-gd

if ! command -v composer &> /dev/null; then
  curl -sS https://getcomposer.org/installer | php
  sudo mv composer.phar /usr/local/bin/composer
fi

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

echo "[2/6] Menyiapkan Database MySQL (${DB_NAME})..."
sudo systemctl enable --now mysql
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;"

echo "[3/6] Menyiapkan Backend Laravel..."
cd "${APP_DIR}/backend-laravel"
if [ ! -f .env ]; then
  cp .env.example .env
fi

sed -i "s/^APP_ENV=.*/APP_ENV=production/" .env
sed -i "s/^APP_DEBUG=.*/APP_DEBUG=false/" .env
sed -i "s/^DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
sed -i "s/^DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" .env

composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --seed --force
php artisan storage:link || true

sudo chown -R www-data:www-data "${APP_DIR}/backend-laravel/storage" "${APP_DIR}/backend-laravel/bootstrap/cache"
sudo chmod -R 775 "${APP_DIR}/backend-laravel/storage" "${APP_DIR}/backend-laravel/bootstrap/cache"

echo "[4/6] Mem-build Frontend React (Vite)..."
cd "${APP_DIR}/app-react"
npm install
npm run build

echo "[5/6] Mengonfigurasi Nginx pada Port 8080..."
sudo cp "${APP_DIR}/deploy/nginx-dicatat.conf" /etc/nginx/sites-available/dicatat
sudo ln -sf /etc/nginx/sites-available/dicatat /etc/nginx/sites-enabled/dicatat
sudo nginx -t
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

echo "===================================================="
echo "✅ DEPLOYMENT SELESAI!"
echo "Aplikasi diCatat sudah berjalan di lokal VPS:"
echo "👉 Aplikasi User : http://127.0.0.1:8080"
echo "👉 Portal Admin  : http://127.0.0.1:8080/admin"
echo "👉 API Health    : http://127.0.0.1:8080/api/health"
echo "Tinggal arahkan Cloudflare Tunnel Anda ke: http://localhost:8080"
echo "===================================================="

