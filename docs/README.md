# Documentation

Welcome to the TCC Tabulation System documentation. This folder contains comprehensive guides for setup, deployment, and project structure.

## Quick Links

- **[Setup Guide](./SETUP.md)** - Local development setup instructions
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment and CI/CD
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Directory organization and file layout

## Getting Started

### For New Developers

1. Read [Setup Guide](./SETUP.md)
2. Clone the repository
3. Follow the setup instructions
4. Run `config/start-all.bat` or `config/start-all.ps1`

### For Deployment

1. Read [Deployment Guide](./DEPLOYMENT.md)
2. Set up GitHub Secrets for CI/CD
3. Push to main branch
4. GitHub Actions handles deployment

### For Understanding the Project

1. Read [Project Structure](./PROJECT_STRUCTURE.md)
2. Explore the codebase
3. Read inline code comments

## Key Technologies

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons
- **Backend**: Laravel 10, MySQL, Redis, Socket.IO
- **DevOps**: GitHub Actions, Vercel, Railway
- **Tools**: Node.js, PHP, Composer

## Common Commands

### Development

```bash
# Start all services
config/start-all.bat          # Windows CMD
config/start-all.ps1          # Windows PowerShell

# Frontend
cd frontend && npm run dev

# Backend
cd backend && php artisan serve

# Update contributors
npm run update-contributors
```

### Production

```bash
# Frontend build
cd frontend && npm run build

# Backend deploy
cd backend && railway up --service backend
```

## Support

For issues or questions:
1. Check relevant documentation
2. Review GitHub Issues
3. Contact development team

## License

This project is proprietary software developed for TCC.
