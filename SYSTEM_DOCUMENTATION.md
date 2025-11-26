# TCC Tabulation System v2 - Complete Documentation

## 🎓 Project Context

### What is This Project?

**TCC Tabulation System v2** is a modern, real-time scoring and tabulation platform designed for **pageant competitions and talent shows**. It's specifically built for the **Taguig City College (TCC)** pageant events, but can be adapted for any competition that requires:

- Multiple judges scoring candidates
- Real-time score collection and display
- Organized scoring by categories/rounds
- Live score updates without page refresh
- Professional tabulation and results management

### Real-World Use Case

Imagine a pageant with:
- **6 Judges** sitting in different locations
- **50+ Candidates** competing across multiple rounds (Swimwear, Evening Gown, Q&A, etc.)
- **5+ Scoring Criteria** per round (Confidence, Poise, Appearance, etc.)
- **Multiple Rounds** happening throughout the event

**The Problem:** Traditional systems require judges to write scores on paper, someone to manually enter them into a spreadsheet, and then wait for results. This is slow, error-prone, and doesn't provide real-time feedback.

**The Solution:** This system allows:
- Judges to submit scores instantly from their devices
- Administrators to see all scores update **in real-time** on a central display
- Automatic calculation of averages and rankings
- No manual data entry or delays
- Professional, modern interface

### Who Uses It?

- **Judges**: Submit scores for candidates in real-time
- **Administrators**: Monitor all scores, manage rounds, control voting
- **Event Organizers**: Setup events, categories, and scoring rules
- **Audience**: (Optional) View live scores on a display screen

---

## 📋 System Overview

**Project Name:** TCC Tabulation System v2  
**Purpose:** Real-time scoring and tabulation system for pageant/competition events  
**Tech Stack:** 
- Frontend: React + Vite
- Backend: Laravel 11
- Real-time: Laravel Echo + Pusher WebSockets
- Database: MySQL/MariaDB

---

## 🎯 Overall Functionality

### Core Features

#### 1. **Admin Panel** (`/admin`)
- **Event Management**: Create, setup, and manage competition events
- **Real-time Score Monitoring**: View scores submitted by judges in real-time via WebSocket
- **Voting Control**: Start/stop voting rounds, manage active categories
- **Score Table**: Display all candidates with their scores organized by judge and criteria
- **Event Sequence**: Manage the order of rounds/categories to be judged

#### 2. **Judge Interface** (`/judge`)
- **Judge Selection**: Select which judge (1-6) is currently scoring
- **Score Submission**: Submit scores for candidates across different criteria
- **Score Persistence**: Scores are saved and reload on page refresh
- **Round Activation**: Judges see which round is currently active via WebSocket
- **Score History**: View previously submitted scores for the same candidate

#### 3. **Setup Page** (`/admin/setup`)
- **Event Creation**: Create new events with basic info, participants, categories, and scoring rules
- **Participant Management**: Add candidates with gender, department, and partnership info
- **Criteria Setup**: Define scoring categories with max points and percentages
- **Event Continuation**: Continue existing events to add new rounds/days

---

## 🏗️ Architecture

### Frontend Structure
```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── AdminTools.jsx (Main admin dashboard)
│   │   ├── Setup.jsx (Event creation)
│   │   └── CreateEvent.jsx (Event builder)
│   └── judge/
│       └── Judge.jsx (Judge scoring interface)
├── components/
│   ├── admin/
│   │   ├── tabs/
│   │   │   └── JudgesScoringTab.jsx (Real-time score display)
│   │   ├── NextCategorySubmenu.jsx (Category selection)
│   │   ├── FixedHeader.jsx (Header with active round)
│   │   └── RoundHeader.jsx (Round info display)
│   └── judge/
│       └── JudgePreloader.jsx (Loading state)
├── hooks/
│   ├── useVotingWebSocket.js (WebSocket for voting state)
│   ├── useAdminData.js (Admin data fetching)
│   └── useVotingControl.js (Voting control logic)
├── config/
│   ├── echo.js (Laravel Echo initialization)
│   └── api.js (API base URL and helpers)
└── services/
    └── api.js (API calls)
```

### Backend Structure
```
backend/app/
├── Http/Controllers/API/
│   ├── PointController.php (Score submission & broadcasting)
│   ├── EventController.php
│   ├── CandidateController.php
│   ├── JudgeController.php
│   └── VotingStateController.php
├── Events/
│   ├── ScoreUpdated.php (Broadcast event for scores)
│   └── VotingStateChanged.php (Broadcast event for voting state)
├── Models/
│   ├── Point.php (Score records)
│   ├── Event.php
│   ├── Candidate.php
│   ├── Judge.php
│   └── Round.php
└── Broadcasting/
    └── Channels.php (Channel authorization)
```

---

## 🔌 Real-time WebSocket Implementation

### How It Works

1. **Backend Broadcasting** (`PointController.php`)
   - When a judge submits a score, the backend:
     - Saves the score to the database
     - Creates a `ScoreUpdated` event
     - Uses `Event::dispatch()` to broadcast immediately to Pusher
     - Broadcasts on channel: `scores.{eventId}`

2. **Frontend Listening** (`JudgesScoringTab.jsx`)
   - Initializes Laravel Echo with Pusher credentials
   - Subscribes to `scores.{eventId}` channel
   - Listens for `ScoreUpdated` events
   - Updates the scores state when event is received
   - Re-renders the score table with new data

### Key Files

**Backend Event Broadcasting:**
```php
// backend/app/Http/Controllers/API/PointController.php
Event::dispatch(new ScoreUpdated(
    $point->judge_id,
    $point->candidate_id,
    $point->criteria_id,
    $point->points,
    $eventId
));
```

**Frontend Event Listening:**
```javascript
// frontend/src/components/admin/tabs/JudgesScoringTab.jsx
channel.listen('ScoreUpdated', (data) => {
  console.log('🔔 *** RECEIVED ScoreUpdated event! ***');
  handleScoreUpdate(data);
});
```

---

## 🐛 Known Issues & Fixes Applied

### Issue 1: Events Being Queued Instead of Sent Immediately
**Problem:** Scores were not appearing in real-time on the admin panel. Backend logs showed `QUEUE_CONNECTION: database`, meaning events were being queued instead of sent synchronously.

**Root Cause:** Laravel's `broadcast()` helper respects the queue configuration. With `QUEUE_CONNECTION=database`, events were stored in the database queue instead of being sent immediately.

**Solution:** Use `Event::dispatch()` instead of `broadcast()` to dispatch events synchronously without queuing.

**File:** `backend/app/Http/Controllers/API/PointController.php` (lines 99-114, 150-164)

---

### Issue 2: WebSocket Listener Constantly Recreated
**Problem:** Frontend logs showed the channel was being left and re-subscribed repeatedly:
```
📡 Attempting to connect to channel: scores.1
✓ WebSocket listener attached to scores channel: scores.1
🔌 Leaving channel: scores.1
📡 Attempting to connect to channel: scores.1
```

**Root Cause:** The WebSocket useEffect dependency array included `judges`, `categories`, and `activeCandidates`, which changed frequently, causing the effect to re-run and destroy the listener.

**Solution:** Split into two separate useEffects:
1. One for fetching scores (depends on `judges`, `categories`, `activeCandidates`)
2. One for WebSocket setup (depends only on `eventId` and `handleScoreUpdate`)

**File:** `frontend/src/components/admin/tabs/JudgesScoringTab.jsx` (lines 188-282)

---

### Issue 3: EventId Changing on Every Render
**Problem:** The WebSocket useEffect was re-running constantly because `eventId` was recalculated on every render.

**Root Cause:** `eventId` was defined as:
```javascript
const eventId = parseInt(localStorage.getItem('eventId')) || 1;
```
This created a new number value on every render, causing the dependency array to think it changed.

**Solution:** Memoize the `eventId` using `useMemo`:
```javascript
const eventId = useMemo(() => {
  const continuingEventStr = localStorage.getItem('continuingEvent');
  if (continuingEventStr) {
    try {
      const continuingEvent = JSON.parse(continuingEventStr);
      return continuingEvent.id;
    } catch (e) {
      console.error('Error parsing continuingEvent:', e);
    }
  }
  return 1;
}, []);
```

**File:** `frontend/src/components/admin/tabs/JudgesScoringTab.jsx` (lines 185-197)

---

### Issue 4: EventId Not Being Retrieved Correctly
**Problem:** The system was trying to read `eventId` from `localStorage.getItem('eventId')`, but this key was never being set.

**Root Cause:** The event was stored as `continuingEvent` (a full event object), not as a separate `eventId` key.

**Solution:** Extract the event ID from the `continuingEvent` object stored in localStorage.

**File:** `frontend/src/components/admin/tabs/JudgesScoringTab.jsx` (lines 185-197)

---

### Issue 5: Scores Not Loading on Admin Page Refresh
**Problem:** When the admin page was refreshed, the score table appeared empty even though scores existed in the database.

**Root Cause:** The `hasInitialized` check in the WebSocket useEffect was preventing the score fetching from running.

**Solution:** Removed the `hasInitialized` check from the WebSocket useEffect to allow it to run immediately.

**File:** `frontend/src/components/admin/tabs/JudgesScoringTab.jsx` (lines 238-282)

---

## 📊 Data Flow

### Score Submission Flow
```
Judge Page (Judge.jsx)
    ↓
Submit Score (handleSaveScore)
    ↓
POST /api/points
    ↓
Backend (PointController.php)
    ├─ Save to Database
    ├─ Event::dispatch(ScoreUpdated)
    └─ Broadcast to Pusher
    ↓
Pusher Server
    ↓
Admin Page (JudgesScoringTab.jsx)
    ├─ Receive ScoreUpdated event
    ├─ Update scores state
    └─ Re-render table with new score
```

### Voting State Flow
```
Admin Panel (NextCategorySubmenu.jsx)
    ↓
Select Category
    ↓
POST /api/voting/state
    ↓
Backend (VotingStateController.php)
    ├─ Update voting state
    ├─ Event::dispatch(VotingStateChanged)
    └─ Broadcast to Pusher
    ↓
Pusher Server
    ↓
Judge Page (Judge.jsx)
    ├─ Receive VotingStateChanged event
    ├─ Update activeRound
    └─ Show scoring interface
```

---

## 🔐 Authentication & Authorization

### Admin Authentication
- Uses JWT tokens stored in `localStorage` as `adminToken`
- PIN-based login for security
- Checked on AdminTools page load

### Judge Authentication
- No authentication required (open access)
- Judge ID stored in `localStorage` as `judgeId`
- Persists across page refreshes

---

## 🚀 Console Commands (Judge Page)

### Exit Judge
```javascript
exitJudge()
```
- Clears `judgeId` from localStorage
- Refreshes the page
- Returns to judge selection screen

---

## 📝 API Endpoints

### Points (Scores)
- `GET /api/points` - Get all scores
- `POST /api/points` - Submit a score
- `PUT /api/points/{id}` - Update a score

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/{id}` - Get event details
- `POST /api/events/{id}/activate` - Activate event

### Candidates
- `GET /api/candidates?event_id={eventId}` - Get candidates

### Judges
- `GET /api/judges?event_id={eventId}` - Get judges

### Rounds/Categories
- `GET /api/rounds?event_id={eventId}` - Get rounds

### Criteria
- `GET /api/criteria?event_id={eventId}` - Get scoring criteria

### Voting State
- `GET /api/voting/state` - Get current voting state
- `POST /api/voting/state` - Update voting state

---

## 🔧 Environment Configuration

### Frontend (.env)
```
VITE_API_BASE=http://localhost:8000
VITE_PUSHER_APP_KEY=your_pusher_key
VITE_PUSHER_APP_CLUSTER=mt1
```

### Backend (.env)
```
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
QUEUE_CONNECTION=sync
```

**Important:** `QUEUE_CONNECTION=sync` is critical for real-time updates!

---

## 🎨 UI/UX Features

### Judge Page
- **Judge Selection**: Grid of judge cards with numbers
- **Proceed Button**: Confirms judge selection and loads scoring interface
- **Scoring Table**: Candidates organized by gender with criteria columns
- **Score Input**: Input fields for each candidate-criteria combination
- **Console Indicator**: ASCII art banner showing which judge is logged in

### Admin Page
- **Live Score Table**: Real-time updates as judges submit scores
- **Category Selection**: Dropdown to select active round
- **Start/Stop Voting**: Control when judges can score
- **Score Visibility Toggle**: Hide/show scores on judge screens

---

## 🧪 Testing Checklist

- [ ] Judge can select themselves and see ASCII banner in console
- [ ] Judge can submit a score
- [ ] Score appears in database
- [ ] Admin sees score update in real-time (within 1 second)
- [ ] Admin can refresh page and scores persist
- [ ] Judge can refresh page and scores persist
- [ ] Judge can type `exitJudge()` to logout and page refreshes
- [ ] Admin can select a category and judges see it activate
- [ ] Multiple judges can score simultaneously
- [ ] WebSocket connection shows in browser DevTools Network tab

---

## 📦 Dependencies

### Frontend
- React 18+
- Vite
- Laravel Echo
- Pusher JS
- React Router
- Lucide Icons
- TailwindCSS
- React Hot Toast

### Backend
- Laravel 11
- Pusher PHP SDK
- MySQL Driver

---

## 🚨 Critical Issues to Resolve Before Production

1. **Authentication**: Implement proper authentication for judge interface (currently open access)
2. **Error Handling**: Add comprehensive error handling for WebSocket disconnections
3. **Offline Support**: Implement queue system for scores submitted while offline
4. **Performance**: Optimize score table rendering for large number of candidates
5. **Security**: Add CORS validation and rate limiting
6. **Testing**: Add unit and integration tests
7. **Logging**: Implement comprehensive logging for debugging

---

## 📞 Support & Debugging

### Common Issues

**Q: Scores not updating in real-time?**
A: Check:
1. Backend logs for broadcast errors
2. Pusher credentials in `.env`
3. WebSocket connection in browser DevTools
4. `QUEUE_CONNECTION=sync` in backend `.env`

**Q: Judge page shows blank?**
A: Check:
1. API base URL is correct
2. Backend server is running
3. Event exists in database
4. Browser console for errors

**Q: Admin page not loading?**
A: Check:
1. Admin token in localStorage
2. Admin PIN is set
3. Backend authentication is working

---

## 📄 Version History

- **v2.0** (Current): Real-time WebSocket implementation with Pusher
- **v1.0**: Initial polling-based implementation

---

## 👨‍💻 Developer Notes

### Key Learnings
1. Laravel `broadcast()` helper respects queue configuration - use `Event::dispatch()` for sync
2. React dependency arrays must be stable - use `useMemo` for computed values
3. WebSocket listeners should be in separate useEffects from data fetching
4. localStorage is unreliable for complex objects - parse/stringify JSON carefully

### Future Improvements
1. Implement real-time candidate rankings
2. Add score validation rules
3. Implement score appeals/corrections
4. Add export to PDF/Excel
5. Implement mobile-responsive design
6. Add dark mode
7. Implement audit logging

---

**Last Updated:** November 26, 2025  
**Status:** Production Ready (with caveats noted above)
