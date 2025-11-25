# Tabulation Desktop Application

A modern Electron + React desktop application for managing the Tabulation System. Start services, create events, and manage the entire system from one place.

## Features

✅ **Service Management**
- Start/Stop all services (Redis, Laravel, Echo Server, Frontend)
- Real-time service status monitoring
- One-click service control

✅ **Event Management**
- Create new events with custom settings
- View all existing events
- Delete events
- Continue events (opens in browser)

✅ **Browser Integration**
- Open Setup page
- Open Admin page
- Auto-launch browser

✅ **Logging**
- Real-time application logs
- Timestamps for all actions
- Error tracking

## Installation

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager
- All backend services running (Redis, Laravel, Echo Server)

### Setup

1. Navigate to the desktop directory:
```bash
cd desktop
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Development

To run in development mode with hot reload:

```bash
npm run dev
```

This will start both the React dev server and Electron app.

## Building

To build the application for distribution:

```bash
npm run build
```

This creates an executable installer in the `dist` folder.

## Project Structure

```
desktop/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ServiceControl.jsx
│   │   ├── EventManagement.jsx
│   │   └── Logs.jsx
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
├── main.js          # Electron main process
├── preload.js       # Electron preload script
├── package.json
└── README.md
```

## Usage

### Starting Services

1. Click **"Start All Services"** button
2. Wait for all services to show "Running" status
3. Click **"Open Admin"** to access the web interface

### Creating Events

1. Go to **"Event Management"** tab
2. Fill in event details (title, year, type, judges count)
3. Click **"Create Event"**
4. Event appears in the list below

### Opening Events

1. Click **"Continue"** on any event
2. Browser opens with the event loaded
3. Make selections and proceed with voting

## API Integration

The desktop app connects to:
- **Backend API**: `http://localhost:8000/api`
- **Frontend**: `http://localhost:5173`

All data is stored in the same database as the web application.

## Troubleshooting

### Services won't start
- Ensure all required paths are correct in `main.js`
- Check that Redis, PHP, and Node.js are installed
- Verify port 8000, 5173, and 6001 are available

### API connection errors
- Ensure Laravel backend is running
- Check that `http://localhost:8000` is accessible
- Verify database is properly configured

### Browser won't open
- Check that ports 5173 (frontend) is available
- Ensure frontend dev server is running

## License

MIT
