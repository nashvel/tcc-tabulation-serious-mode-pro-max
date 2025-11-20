# Setup Guide

## Prerequisites

- Node.js 18+
- PHP 8.1+
- Composer
- MySQL 8.0+
- Redis (included in `server/redis`)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/nashvel/tcc-tabulation-serious-mode-pro-max.git
cd tcc-tabulation-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# (Optional) Seed database
php artisan db:seed
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API URL
# VITE_API_URL=http://localhost:8000
```

### 4. Start Development Services

#### Option A: Batch Script (Windows CMD)

```bash
config/start-all.bat
```

#### Option B: PowerShell Script (Windows)

```bash
powershell -ExecutionPolicy Bypass -File config/start-all.ps1
```

#### Option C: Manual Start

Open 4 terminals and run:

**Terminal 1 - Redis:**
```bash
cd server/redis
redis-server
```

**Terminal 2 - Laravel:**
```bash
cd backend
php artisan serve
```

**Terminal 3 - Echo Server:**
```bash
cd backend
laravel-echo-server start
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Echo Server: localhost:6001
- Redis: localhost:6379

## Environment Variables

### Backend (.env)

```
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tcc_tabulation
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:6001
```

## Database Setup

### Create Database

```bash
mysql -u root -p
CREATE DATABASE tcc_tabulation;
EXIT;
```

### Run Migrations

```bash
cd backend
php artisan migrate
```

### Seed Sample Data (Optional)

```bash
php artisan db:seed
```

## Troubleshooting

### Redis Connection Error

- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check Redis is on port 6379

### Laravel Connection Error

- Verify MySQL is running
- Check `.env` database credentials
- Run `php artisan migrate` again

### Frontend Build Error

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run build --force`

### Echo Server Connection Error

- Verify Redis is running
- Check `laravel-echo-server.json` configuration
- Restart Echo Server

## Development Commands

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend

```bash
cd backend

# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Clear cache
php artisan cache:clear

# Generate API documentation
php artisan scribe:generate
```

### Scripts

```bash
# Update contributors list
npm run update-contributors
```

## Next Steps

1. Read [API Documentation](./API.md)
2. Read [Project Structure](./PROJECT_STRUCTURE.md)
3. Read [Deployment Guide](./DEPLOYMENT.md)
