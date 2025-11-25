# Pusher Setup Guide

## Step 1: Create Pusher Account
1. Go to https://pusher.com
2. Sign up for a free account
3. Create a new app

## Step 2: Get Your Credentials
From your Pusher app dashboard, copy:
- **App ID**
- **Key**
- **Secret**
- **Cluster** (e.g., `mt1`, `us2`, `eu`)

## Step 3: Update Backend `.env`
Add to your `backend/.env`:

```env
BROADCAST_DRIVER=pusher
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

## Step 4: Update Frontend `.env`
Add to your `frontend/.env.local`:

```env
VITE_PUSHER_APP_KEY=your_app_key
VITE_PUSHER_APP_CLUSTER=your_cluster
```

## Step 5: Start Services
```bash
config/start-all.bat
```

Only 2 services will start:
- Laravel Backend (port 8000)
- Frontend Dev (port 5173)

## Verification
1. Open http://localhost:5173 in your browser
2. Check browser console for "✅ Echo connected successfully"
3. Try switching categories - should update in real-time!

## Notes
- No more Redis or Echo Server needed
- Cloud-based broadcasting via Pusher
- Works offline (Pusher handles connectivity)
- Free tier supports up to 100 concurrent connections
