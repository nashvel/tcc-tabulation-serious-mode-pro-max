# Design Document

## Overview

Redesign the Flutter desktop app with a Supabase-inspired layout: narrow left sidebar, main content area with header, and compact server controls. Pure white/black minimalist aesthetic.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│ ┌────┐ ┌──────────────────────────────────────────┐ │
│ │    │ │ Header: Title + Toggle (Login/Servers)  │ │
│ │ S  │ ├──────────────────────────────────────────┤ │
│ │ I  │ │                                          │ │
│ │ D  │ │  Main Content Area                       │ │
│ │ E  │ │  - Login Form (centered)                 │ │
│ │ B  │ │  - OR Server List (table-like)           │ │
│ │ A  │ │                                          │ │
│ │ R  │ │                                          │ │
│ │    │ │                                          │ │
│ └────┘ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## Components

### Color Palette
```dart
background: Color(0xFFFFFFFF)  // Pure white
text: Color(0xFF000000)         // Black
textMuted: Color(0xFF666666)    // Gray for secondary text
border: Color(0xFFE5E5E5)       // Light gray borders
hover: Color(0xFFF5F5F5)        // Subtle hover state
```

### Typography
```dart
// Headings
fontSize: 14, fontWeight: FontWeight.w600

// Body
fontSize: 12, fontWeight: FontWeight.w400

// Small/Muted
fontSize: 11, color: textMuted

// Monospace (paths, commands)
fontFamily: 'JetBrains Mono' or 'Consolas'
fontSize: 11
```

### Sidebar (50px wide)
- White background
- Black icons (18px)
- No text labels
- Selected: light gray background (#f5f5f5)
- Bottom: settings icon

### Server Row Layout
```
┌─────────────────────────────────────────────────────┐
│ ● Backend     /path/to/backend...    [Start] [⋮]   │
├─────────────────────────────────────────────────────┤
│ ○ Reverb      WebSocket :8080        [Start] [⋮]   │
├─────────────────────────────────────────────────────┤
│ ○ Frontend    /path/to/frontend...   [Start] [⋮]   │
└─────────────────────────────────────────────────────┘

● = Running (filled black dot)
○ = Stopped (empty circle)
```

## Data Models

No changes to data models - same server_paths.json and database.json.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

All requirements are visual/styling - no testable properties needed.

## Error Handling

Same as before - display errors inline or in dialogs.

## Testing Strategy

Manual visual testing to verify:
- Colors match spec
- Font sizes are correct
- Layout is compact
- Sidebar is narrow
- Server rows are single-line
