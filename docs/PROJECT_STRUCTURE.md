# Project Structure

```
tcc-tabulation-system/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── frontend-deploy.yml
│       ├── backend-deploy.yml
│       └── update-contributors.yml
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and helpers
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # Laravel API backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API controllers
│   │   │   └── Requests/      # Form requests
│   │   ├── Models/            # Database models
│   │   └── Events/            # Broadcasting events
│   ├── routes/
│   │   ├── api.php            # API routes
│   │   └── web.php            # Web routes
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/           # Database seeders
│   ├── config/
│   ├── .env.example
│   ├── composer.json
│   └── artisan
│
├── scripts/                    # Utility scripts
│   ├── lib/
│   │   ├── github.js          # GitHub API utilities
│   │   ├── html-generator.js  # HTML generation
│   │   └── readme-updater.js  # README updater
│   └── update-contributors.js # Main script
│
├── server/                     # Local development server
│   └── redis/                 # Redis installation
│
├── docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md
│   ├── SETUP.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── config/                     # Configuration files
│   ├── start-all.bat          # Windows startup script
│   └── start-all.ps1          # PowerShell startup script
│
├── .gitignore
├── .env.example
├── package.json               # Root package.json
├── README.md
└── LICENSE
```

## Directory Descriptions

### `.github/workflows/`
GitHub Actions CI/CD pipeline configurations for automated testing and deployment.

### `frontend/`
React 18+ frontend application with Vite bundler. Contains all UI components, pages, and hooks.

### `backend/`
Laravel 10+ REST API backend. Handles business logic, database operations, and WebSocket events.

### `scripts/`
Utility scripts for project maintenance:
- `update-contributors.js` - Fetches and updates contributor list from GitHub
- `lib/` - Modular utilities for GitHub API, HTML generation, and file updates

### `server/`
Local development server configurations and Redis installation.

### `docs/`
Project documentation including setup guides, API documentation, and deployment instructions.

### `config/`
Configuration and startup scripts for development environment.

## Key Files

- **README.md** - Project overview and quick start
- **package.json** - Root dependencies and scripts
- **.env.example** - Environment variables template
- **.gitignore** - Git ignore rules
- **LICENSE** - Project license
