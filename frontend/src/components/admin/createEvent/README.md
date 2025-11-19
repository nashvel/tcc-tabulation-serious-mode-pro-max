# Create Event - Modular Component Structure

## 📁 File Structure

```
/components/admin/createEvent/
├── EventDaysSection.jsx      - Event days configuration (multi-day support)
├── ProgressSteps.jsx          - Progress indicator (4 steps)
├── Step1BasicInfo.jsx         - Event name, date, description, days, people
├── Step2Participants.jsx      - Candidates/participants management
├── Step3Categories.jsx        - Categories configuration
├── Step4ScoreRules.jsx        - Criteria with percentage validation
└── README.md                  - This file

/pages/admin/
├── CreateEvent.jsx            - OLD VERSION (821 lines) ❌
└── CreateEvent_NEW.jsx        - NEW VERSION (355 lines) ✅
```

## ✨ Benefits of Modular Structure

### Before (CreateEvent.jsx - 821 lines)
- ❌ All code in one massive file
- ❌ Hard to find specific sections
- ❌ Difficult to maintain
- ❌ Can't reuse components

### After (CreateEvent_NEW.jsx - 355 lines)
- ✅ Clean separation of concerns
- ✅ Each step is its own file
- ✅ Easy to find and update
- ✅ Reusable components
- ✅ Better team collaboration

## 📦 Components

### 1. **EventDaysSection.jsx**
Multi-day event configuration with independent tabulation per day.

**Props:**
- `eventDays` - Array of day objects
- `addEventDay` - Function to add new day
- `removeEventDay` - Function to remove day
- `updateEventDay` - Function to update day fields

**Features:**
- Orange highlighted section
- Each day has title and event type
- Info box explaining independent records
- Professional card design

---

### 2. **ProgressSteps.jsx**
Visual progress indicator for the 4-step form.

**Props:**
- `currentStep` - Current active step (1-4)

**Features:**
- Fixed position at top
- Orange theme for active/completed steps
- Checkmarks for completed steps
- Connecting lines between steps

---

### 3. **Step1BasicInfo.jsx**
Basic event information and configuration.

**Props:**
- `eventData` - Event basic info object
- `setEventData` - Update event data
- `eventDays` - Event days array
- `addEventDay`, `removeEventDay`, `updateEventDay` - Day handlers
- `importantPeople` - Important people array
- `setImportantPeople` - Update important people

**Fields:**
- Event Name (required, validated)
- Event Date (required, validated)
- Event Description (optional)
- Event Days (with EventDaysSection component)
- Important People (dynamic list)

---

### 4. **Step2Participants.jsx**
Candidate/participant management.

**Props:**
- `eventData` - For event type checking
- `candidates` - Candidates array
- `addCandidate`, `removeCandidate`, `updateCandidate` - Handlers

**Features:**
- Dynamic fields based on event type (pageant/competition)
- Support for solo/duo/squad/group
- Partner information for duo pageants
- Team name and department fields

---

### 5. **Step3Categories.jsx**
Categories configuration.

**Props:**
- `categories` - Categories array
- `addCategory`, `removeCategory`, `updateCategory` - Handlers

**Fields:**
- Category Name
- Category Description (optional)

---

### 6. **Step4ScoreRules.jsx**
Criteria and score rules with validation.

**Props:**
- `criteria` - Criteria array
- `addCriterion`, `removeCriterion`, `updateCriterion` - Handlers
- `totalPercentage` - Calculated total percentage

**Features:**
- Real-time percentage validation
- Visual validation card (green/red)
- Must total 100%
- Criterion name, max score, percentage, description

---

## 🚀 How to Use

### Replace Old File
1. Backup old `CreateEvent.jsx`
2. Rename `CreateEvent_NEW.jsx` to `CreateEvent.jsx`
3. Delete the old file

### Or Test Side-by-Side
Update your route in `App.jsx`:
```javascript
// Old
import CreateEvent from './pages/admin/CreateEvent';

// New
import CreateEvent from './pages/admin/CreateEvent_NEW';
```

## 📊 Line Count Comparison

| File | Lines | Purpose |
|------|-------|---------|
| **OLD CreateEvent.jsx** | 821 | Everything in one file |
| **NEW CreateEvent_NEW.jsx** | 355 | Main logic only |
| EventDaysSection.jsx | 106 | Event days UI |
| Step1BasicInfo.jsx | 172 | Step 1 UI |
| Step2Participants.jsx | 130 | Step 2 UI |
| Step3Categories.jsx | 60 | Step 3 UI |
| Step4ScoreRules.jsx | 115 | Step 4 UI |
| ProgressSteps.jsx | 64 | Progress bar |
| **TOTAL** | 1,002 | Better organized! |

## 🎯 Key Features

- ✅ Multi-day event support (each day is independent)
- ✅ Real-time validation with Material Icons
- ✅ Toast notifications (react-hot-toast)
- ✅ Professional UI with Tailwind CSS
- ✅ Score percentage validation
- ✅ Dynamic fields based on event type
- ✅ Clean, maintainable code structure

## 🔧 Maintenance

### Adding a New Field
1. Add state in `CreateEvent_NEW.jsx`
2. Update the relevant Step component
3. Update backend validation if needed

### Modifying UI
1. Find the specific Step component
2. Edit only that file
3. Changes are isolated and safe

---

**Created:** Nov 8, 2025  
**Author:** Cascade AI  
**Purpose:** Refactor CreateEvent into modular, maintainable components
