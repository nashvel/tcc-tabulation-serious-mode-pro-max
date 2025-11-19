#!/bin/bash
set -e

echo "=== Starting on PORT: ${PORT:-80} ==="

# Set default PORT if not provided
export PORT="${PORT:-80}"

# Update Apache ports.conf with actual PORT value
echo "Listen ${PORT}" > /etc/apache2/ports.conf

# Update VirtualHost to use actual PORT
sed -i "s/\${PORT}/${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Quick setup
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

# Ensure database file exists
if [ ! -f storage/database.sqlite ]; then
    echo "=== Creating database file ==="
    touch storage/database.sqlite
fi

chown -R www-data:www-data storage bootstrap/cache public
chmod -R 775 storage bootstrap/cache public
chmod 664 storage/database.sqlite
ln -sf ../storage/app/public public/storage 2>/dev/null || true

# Run migrations and seed in one command
echo "=== Running database migrations and seeding ==="
php artisan migrate --seed --force || echo "Migration/seeding failed or already completed"

echo "=== Apache listening on port ${PORT} ==="

# Start Apache in foreground
exec apache2-foreground
