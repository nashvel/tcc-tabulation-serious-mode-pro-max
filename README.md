# TCC Tabulation System - Serious Mode Pro Max

![Contributors](https://img.shields.io/github/contributors/nashvel/tcc-tabulation-serious-mode-pro-max?style=for-the-badge)
![Commits](https://img.shields.io/github/commit-activity/m/nashvel/tcc-tabulation-serious-mode-pro-max?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/nashvel/tcc-tabulation-serious-mode-pro-max?style=for-the-badge)

A comprehensive real-time event tabulation and judging system built for managing pageants, competitions, and contests. The system provides live score tracking, judge management, and real-time synchronization across multiple devices using WebSocket technology.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/nashvel">
        <img src="https://github.com/nashvel.png" width="100px;" alt="nashvel"/>
        <br />
        <sub><b>nashvel</b></sub>
      </a>
      <br />
      <sub>9 commits (90%)</sub>
      <br />
      💻 🎨 📖 🏗️
    </td>
    <td align="center">
      <a href="https://github.com/Brandon">
        <img src="https://github.com/Brandon.png" width="100px;" alt="Brandon"/>
        <br />
        <sub><b>Brandon</b></sub>
      </a>
      <br />
      <sub>1 commit (10%)</sub>
      <br />
      🚀
    </td>
  </tr>
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

### Contribution Stats

![GitHub Contributors Image](https://contrib.rocks/image?repo=nashvel/tcc-tabulation-serious-mode-pro-max)

---

## Project Overview

The TCC Tabulation System is a full-stack application designed to streamline the judging process for large-scale events. It features a desktop application for event management, a web-based admin panel for real-time control, and judge portals for score submission with live synchronization.

### Key Features

- Real-time WebSocket-based score updates across all connected clients
- Multi-judge scoring with occupation management and screen locking
- Event sequence management with drag-and-drop interface
- Admin dashboard with comprehensive event controls
- Judge portal with secure authentication and score submission
- Live scoreboard display for audience viewing
- Event data preservation and session documentation
- Responsive design with modern UI components
- Comprehensive API documentation with Swagger/OpenAPI

## Technology Stack

### Frontend
- React 18+ with React Router for navigation
- TailwindCSS for styling with utility-first approach
- Lucide React for consistent iconography
- Socket.IO client for real-time WebSocket communication
- React Hot Toast for notifications
- Axios for API requests

### Backend
- Laravel 10+ framework with RESTful API design
- Laravel Echo for WebSocket broadcasting
- Socket.IO server for real-time event handling
- MySQL 8.0+ database
- Redis for caching and session management
- Laravel Sanctum for API authentication (optional)

### Infrastructure
- Redis server for real-time data and caching
- Node.js for Echo Server (WebSocket layer)
- PHP 8.1+ for Laravel backend
- Nginx/Apache for web server

## Project Structure

```
tabulation-systemv2/
├── backend/                          # Laravel API backend
│   ├── app/
│   │   ├── Http/Controllers/        # API controllers
│   │   ├── Models/                  # Database models
│   │   ├── Events/                  # Broadcast events
│   │   └── ...
│   ├── database/
│   │   ├── migrations/              # Database schema
│   │   └── seeders/                 # Test data
│   ├── routes/
│   │   └── api.php                  # API route definitions
│   └── ...
├── frontend/                         # React web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # Admin panel components
│   │   │   ├── judge/               # Judge portal components
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── config/                  # Configuration files
│   │   ├── api/                     # API service layer
│   │   └── ...
│   └── ...
├── server/
│   └── redis/                       # Local Redis installation
├── start-all.bat                    # Windows batch startup script
├── start-all.ps1                    # PowerShell startup script
└── README.md                        # This file
```

## Installation

### Prerequisites

- Node.js 16+ and npm
- PHP 8.1+
- Composer
- MySQL 8.0+
- Redis (included in server/redis directory)
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Configure database in `.env`:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=tabulation_system
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. Run database migrations:
   ```bash
   php artisan migrate
   ```

7. Seed test data (optional):
   ```bash
   php artisan db:seed
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure API endpoint in `.env.local`:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_SOCKET_URL=http://localhost:6001
   ```

## Running the Application

### Option 1: Automated Startup (Recommended)

#### Windows Batch Script
```bash
start-all.bat
```

#### PowerShell Script
```powershell
powershell -ExecutionPolicy Bypass -File start-all.ps1
```

Both scripts will automatically start all required services in separate terminal windows:
1. Redis server (port 6379)
2. Laravel backend (port 8000)
3. Echo WebSocket server (port 6001)
4. Frontend development server (port 5173)

### Option 2: Manual Startup

#### Terminal 1 - Redis Server
```bash
cd server/redis
redis-server
```

#### Terminal 2 - Laravel Backend
```bash
cd backend
php artisan serve
```

#### Terminal 3 - Echo Server (WebSocket)
```bash
cd backend
laravel-echo-server start
```

#### Terminal 4 - Frontend Development
```bash
cd frontend
npm run dev
```

## WebSocket Configuration

### Backend Configuration

1. Update `backend/config/broadcasting.php`:
   ```php
   'default' => env('BROADCAST_DRIVER', 'redis'),
   
   'connections' => [
       'redis' => [
           'driver' => 'redis',
           'connection' => 'default',
       ],
   ]
   ```

2. Configure Echo Server in `backend/laravel-echo-server.json`:
   ```json
   {
       "authHost": "http://localhost",
       "authEndpoint": "/broadcasting/auth",
       "clients": [
           {
               "appId": "your-app-id",
               "key": "your-app-key"
           }
       ],
       "database": "redis",
       "databaseConfig": {
           "redis": {
               "port": 6379,
               "host": "127.0.0.1"
           }
       },
       "apiOriginAllow": {
           "allowCors": true,
           "allowOrigins": ["*"],
           "allowMethods": ["GET", "POST"],
           "allowHeaders": ["Origin", "Content-Type", "X-Auth-Token", "X-Requested-With", "Accept", "Authorization"]
       }
   }
   ```

3. Enable broadcasting in `.env`:
   ```
   BROADCAST_DRIVER=redis
   QUEUE_CONNECTION=redis
   ```

### Frontend Configuration

The frontend automatically connects to the WebSocket server via `src/config/echo.js`:

```javascript
import io from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:6001`, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});
```

### Real-Time Event Channels

The system broadcasts events on the following channels:

- `voting-state`: Voting state changes (round activation, lock/unlock)
- `scores.{eventId}`: Score updates for specific events
- `judges.{eventId}`: Judge occupation changes

### Listening to WebSocket Events

Example from `src/hooks/useVotingWebSocket.js`:

```javascript
useEffect(() => {
    const echo = initializeEcho();
    
    if (echo) {
        const channel = echo.channel('voting-state');
        
        channel.listen('.voting.state.changed', (data) => {
            console.log('Voting state updated:', data);
            handleVotingStateChange(data);
        });
    }
    
    return () => {
        if (echo) {
            echo.leave('voting-state');
        }
    };
}, []);
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/change-pin` - Change admin PIN

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Voting Control
- `GET /api/voting/state` - Get current voting state
- `POST /api/voting/activate-round` - Activate a round
- `POST /api/voting/lock` - Lock all judge screens
- `POST /api/voting/unlock` - Unlock all judge screens
- `POST /api/voting/stop` - Stop voting session

### Judge Management
- `GET /api/occupied-judges` - Get occupied judge slots
- `POST /api/occupy-judge` - Occupy a judge slot
- `POST /api/clear-occupied-judges` - Clear all judge occupations

### Scoring
- `POST /api/points` - Submit score
- `GET /api/points` - Get all scores
- `GET /api/scoreboard` - Get scoreboard data

For complete API documentation, visit `http://localhost:8000/api/documentation` after starting the backend.

## Usage Guide

### Admin Panel

1. Access at `http://localhost:5173/admin`
2. Login with admin PIN
3. Create or select an event
4. Add candidates and criteria
5. Build event sequence by selecting rounds in order
6. Start event to activate first round
7. Use control buttons to:
   - Lock/unlock judge screens
   - Switch to next category
   - Clear judge selections
   - Stop event

### Judge Portal

1. Access at `http://localhost:5173/judge`
2. Select your judge number (1-5)
3. Wait for admin to activate a round
4. Enter scores for each candidate and criterion
5. Scores auto-save on blur
6. View lock screen if admin locks the session

### Scoreboard Display

1. Access at `http://localhost:5173/scoreboard`
2. Displays real-time scores as judges submit
3. Updates automatically via WebSocket

## Database Schema

### Key Tables

- `events` - Event information and status
- `candidates` - Participant data
- `rounds` - Judging categories/rounds
- `criteria` - Scoring criteria per round
- `voting_points` - Individual judge scores
- `voting_states` - Current voting session state
- `voting_sessions` - Historical voting sessions
- `event_sequences` - Ordered list of rounds for event

## Troubleshooting

### WebSocket Connection Issues

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```
   Should return: `PONG`

2. Check Echo Server is running:
   ```bash
   curl http://localhost:6001
   ```

3. Verify CORS settings in `laravel-echo-server.json`

4. Check browser console for connection errors

### Database Connection Issues

1. Verify MySQL is running
2. Check `.env` database credentials
3. Run migrations: `php artisan migrate`

### Port Conflicts

If ports are already in use, modify:
- Redis: Change port in `redis.windows.conf`
- Laravel: `php artisan serve --port=8001`
- Echo Server: Modify port in `laravel-echo-server.json`
- Frontend: `npm run dev -- --port 5174`

## Performance Optimization

- Redis caching for frequently accessed data
- WebSocket for real-time updates instead of polling
- Database query optimization with eager loading
- Frontend code splitting and lazy loading
- Compression and minification in production builds

## Security Considerations

- Admin authentication with PIN verification
- Judge occupation prevents duplicate logins
- CORS configuration for cross-origin requests
- Input validation on all API endpoints
- Database migrations for schema versioning
- Environment variables for sensitive configuration

## Contributing

This project was developed as a capstone project for TCC (Technological Career College). Contributions are welcome through pull requests.

## License

This project is proprietary software developed for TCC. All rights reserved.

## Support

For issues, questions, or feature requests, please contact the development team or create an issue in the project repository.

## Changelog

### Version 1.0.0 (Current)
- Initial release with full event tabulation system
- Real-time WebSocket voting updates
- Judge occupation and screen locking
- Event sequence management
- Comprehensive admin dashboard
- Judge portal with score submission
- Live scoreboard display
- API documentation with Swagger

---

**Last Updated:** November 21, 2025
**Status:** Active Development
**Repository:** https://github.com/nashvel/tcc-tabulation-serious-mode-pro-max
