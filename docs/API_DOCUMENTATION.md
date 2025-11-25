# API Documentation

## Overview

The TCC Tabulation System API is a comprehensive REST API built with Laravel 10 that provides endpoints for event management, candidate scoring, and real-time voting state management.

**Base URL:** `http://localhost:8000/api`

**Production URL:** `https://api.tcc-tabulation.com/api`

## Interactive Documentation

Access the interactive Swagger UI at:
- **Local:** http://localhost:8000/api/documentation
- **Production:** https://api.tcc-tabulation.com/api/documentation

## Authentication

### Admin Login

**Endpoint:** `POST /admin/login`

**Request:**
```json
{
  "email": "admin@tcc.com",
  "pin": "1234"
}
```

**Response:**
```json
{
  "token": "1|abcdef123456...",
  "user": {
    "id": 1,
    "email": "admin@tcc.com",
    "name": "Admin User"
  }
}
```

**Usage:** Include the token in subsequent requests:
```
Authorization: Bearer 1|abcdef123456...
```

## API Endpoints

### Authentication

- `POST /admin/login` - Admin login
- `POST /admin/change-pin` - Change admin PIN (requires auth)

### Events

- `GET /events` - List all events
- `GET /events/active` - Get active event
- `GET /events/{id}` - Get event details
- `POST /events` - Create event (requires auth)
- `PUT /events/{id}` - Update event (requires auth)
- `DELETE /events/{id}` - Delete event (requires auth)
- `POST /events/{id}/activate` - Activate event
- `POST /events/{id}/complete` - Mark event complete (requires auth)
- `POST /events/{id}/archive` - Archive event (requires auth)

### Candidates

- `GET /candidates` - List candidates
- `POST /candidates` - Create candidate (requires auth)
- `PUT /candidates/{id}` - Update candidate (requires auth)
- `DELETE /candidates/{id}` - Delete candidate (requires auth)

### Rounds

- `GET /rounds` - List rounds
- `POST /rounds` - Create round (requires auth)
- `PUT /rounds/{id}` - Update round (requires auth)
- `DELETE /rounds/{id}` - Delete round (requires auth)

### Criteria

- `GET /criteria` - List criteria
- `POST /criteria` - Create criteria (requires auth)
- `PUT /criteria/{id}` - Update criteria (requires auth)
- `DELETE /criteria/{id}` - Delete criteria (requires auth)

### Voting State

- `GET /voting/state` - Get current voting state
- `GET /voting/history` - Get voting history
- `POST /voting/start-first-round` - Start first round
- `POST /voting/activate-round` - Activate specific round
- `POST /voting/lock` - Lock judge screens
- `POST /voting/unlock` - Unlock judge screens

### Judge Management

- `GET /occupied-judges` - Get occupied judge slots
- `POST /occupy-judge` - Mark judge slot as occupied
- `POST /clear-occupied-judges` - Clear all occupied judges

### Points (Scores)

- `GET /points` - List all scores
- `POST /points` - Submit/update score
- `PUT /points/{id}` - Update score (requires auth)
- `DELETE /points/{id}` - Delete score (requires auth)
- `GET /scoreboard` - Get aggregated scoreboard

### Event Sequence

- `GET /event-sequence` - Get event round sequence
- `POST /event-sequence` - Add round to sequence
- `DELETE /event-sequence/{id}` - Remove from sequence
- `POST /event-sequence/reorder` - Reorder rounds
- `POST /event-sequence/{id}/move-up` - Move round up
- `POST /event-sequence/{id}/move-down` - Move round down

### Templates

- `GET /templates` - List event templates (requires auth)
- `GET /templates/{id}` - Get template details (requires auth)
- `POST /templates/{id}/apply` - Apply template to event (requires auth)

## Common Request/Response Examples

### Create Event

**Request:**
```bash
curl -X POST http://localhost:8000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Miss Universe 2024",
    "year": 2024,
    "date": "2024-11-21"
  }'
```

**Response:**
```json
{
  "id": 1,
  "title": "Miss Universe 2024",
  "year": 2024,
  "date": "2024-11-21",
  "status": "draft",
  "created_at": "2024-11-21T10:30:00Z",
  "updated_at": "2024-11-21T10:30:00Z"
}
```

### Add Candidate

**Request:**
```bash
curl -X POST http://localhost:8000/api/candidates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "number": 1,
    "name": "Maria Santos",
    "gender": "Female"
  }'
```

### Submit Score

**Request:**
```bash
curl -X POST http://localhost:8000/api/points \
  -H "Content-Type: application/json" \
  -d '{
    "judge_id": 1,
    "candidate_id": 1,
    "round_id": 1,
    "criteria_id": 1,
    "points": 85.5
  }'
```

### Get Voting State

**Request:**
```bash
curl -X GET http://localhost:8000/api/voting/state?event_id=1
```

**Response:**
```json
{
  "id": 1,
  "event_id": 1,
  "is_active": true,
  "is_locked": false,
  "active_round_id": 1,
  "active_round_name": "Preliminary",
  "created_at": "2024-11-21T10:30:00Z",
  "updated_at": "2024-11-21T10:30:00Z"
}
```

### Activate Round

**Request:**
```bash
curl -X POST http://localhost:8000/api/voting/activate-round \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "round_id": 1
  }'
```

### Lock Screens

**Request:**
```bash
curl -X POST http://localhost:8000/api/voting/lock \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1
  }'
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
  "message": "Not found."
}
```

### 422 Unprocessable Entity
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "points": ["The points must be between 0 and 100."]
  }
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15)

**Response:**
```json
{
  "data": [...],
  "current_page": 1,
  "total": 50,
  "per_page": 15,
  "last_page": 4
}
```

## WebSocket Events

In addition to REST endpoints, the system uses WebSocket for real-time updates:

**Channel:** `voting-state`

**Events:**
- `voting-state-changed` - Voting state updated
- `round-activated` - New round activated
- `screens-locked` - Judge screens locked
- `screens-unlocked` - Judge screens unlocked
- `scores-updated` - New scores submitted

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** - Never expose in client-side code
3. **Validate input** - Client-side validation before API calls
4. **Handle errors gracefully** - Implement proper error handling
5. **Use pagination** - For large datasets
6. **Cache responses** - When appropriate
7. **Implement retry logic** - For failed requests

## Support

For API issues or questions:
- Check the [Swagger documentation](http://localhost:8000/api/documentation)
- Review [GitHub issues](https://github.com/nashvel/tcc-tabulation-serious-mode-pro-max/issues)
- Contact the development team

## Changelog

### Version 2.0.0 (Current)
- Complete API rewrite with Laravel 10
- WebSocket support for real-time updates
- Improved authentication with Sanctum
- Comprehensive Swagger documentation
- Event sequence management
- Judge occupation tracking
- Real-time voting state management
