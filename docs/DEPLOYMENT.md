# Deployment Guide

This project is deployed on Vercel (frontend) and Railway (backend) with GitHub Actions CI/CD.

## Automatic Deployment (CI/CD)

### Setup

See [CI/CD Setup Instructions](../README.md#cicd-setup)

### How It Works

1. Push code to `main` branch
2. GitHub Actions automatically triggers
3. Frontend deploys to Vercel
4. Backend deploys to Railway
5. Contributors list updates weekly

### Workflow Files

- `.github/workflows/frontend-deploy.yml` - Vercel deployment
- `.github/workflows/backend-deploy.yml` - Railway deployment
- `.github/workflows/update-contributors.yml` - Contributors update

## Manual Deployment

### Frontend (Vercel)

#### Prerequisites

```bash
npm install -g vercel
vercel login
```

#### Deploy

```bash
cd frontend
npm run build
vercel deploy --prod
```

### Backend (Railway)

#### Prerequisites

```bash
npm install -g @railway/cli
railway login
```

#### Deploy

```bash
cd backend
railway up --service backend
```

## Environment Variables

### Vercel (Frontend)

Set in Vercel project settings:

```
VITE_API_URL=https://your-backend-url
VITE_SOCKET_URL=https://your-socket-url
```

### Railway (Backend)

Set in Railway project settings:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend-url

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

## Monitoring

### GitHub Actions

1. Go to repository
2. Click "Actions" tab
3. View workflow runs and logs

### Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project
3. View deployments and logs

### Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Select project
3. View deployments and logs

## Rollback

### Vercel

1. Go to Vercel Dashboard
2. Select project
3. Go to Deployments
4. Click on previous deployment
5. Click "Promote to Production"

### Railway

1. Go to Railway Dashboard
2. Select project
3. Go to Deployments
4. Select previous deployment
5. Click "Redeploy"

## Performance Optimization

### Frontend

- Code splitting with React.lazy()
- Image optimization
- CSS minification
- JavaScript minification
- Gzip compression

### Backend

- Database query optimization
- Redis caching
- API response caching
- Database indexing

## Security

- HTTPS enforced
- CORS configured
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify environment variables
3. Check build output
4. Review error messages

### Application Errors

1. Check application logs
2. Verify database connection
3. Check Redis connection
4. Review API responses

### Performance Issues

1. Check database queries
2. Monitor Redis usage
3. Review API response times
4. Check frontend bundle size

## Maintenance

### Database Backups

- Set up automated backups in Railway
- Download backups regularly
- Test restore procedures

### Monitoring

- Set up error tracking (Sentry)
- Monitor API response times
- Monitor database performance
- Monitor Redis usage

### Updates

- Keep dependencies updated
- Test updates in staging
- Deploy to production
- Monitor for issues
