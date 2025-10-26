# Google Calendar Clone - API Specification

## Base Configuration
- **Base URL**: `http://localhost:3001`
- **Authentication**: Session-based with `x-session-id` header
- **Content-Type**: `application/json`

## Response Format
```json
{
  "success": boolean,
  "data": object,
  "message": string,
  "error": string // only on errors
}
```

---

## Authentication Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string", 
      "name": "string",
      "timezone": "string"
    },
    "sessionId": "string"
  }
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:** Same as register

### POST /api/auth/logout
**Headers:** `x-session-id: string`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
**Headers:** `x-session-id: string`
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "timezone": "string"
  }
}
```

### PUT /api/auth/profile
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "name": "string",
  "timezone": "string"
}
```

### PUT /api/auth/change-password
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### DELETE /api/auth/account
**Headers:** `x-session-id: string`
**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Calendar Endpoints

### GET /api/calendars
**Headers:** `x-session-id: string`
**Query:** `?includeShared=boolean`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "color": "string",
      "isDefault": boolean,
      "isPublic": boolean,
      "userId": "string"
    }
  ]
}
```

### POST /api/calendars
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "name": "string",
  "description": "string",
  "color": "string",
  "isPublic": boolean
}
```

### PUT /api/calendars/:id
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "name": "string",
  "description": "string", 
  "color": "string"
}
```

### DELETE /api/calendars/:id
**Headers:** `x-session-id: string`

### POST /api/calendars/:id/share
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "email": "string",
  "role": "viewer" | "editor"
}
```

### GET /api/calendars/:id/shares
**Headers:** `x-session-id: string`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "role": "string",
      "user": {
        "name": "string",
        "email": "string"
      }
    }
  ]
}
```

---

## Event Endpoints

### GET /api/events
**Headers:** `x-session-id: string`
**Query:** `?limit=number&offset=number&calendarId=string`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "startTime": "ISO_DATE",
      "endTime": "ISO_DATE",
      "isAllDay": boolean,
      "location": "string",
      "color": "string",
      "calendarId": "string",
      "isRecurring": boolean,
      "recurrenceRule": "string",
      "calendar": {
        "id": "string",
        "name": "string",
        "color": "string"
      },
      "participants": [
        {
          "id": "string",
          "email": "string",
          "name": "string",
          "status": "pending" | "accepted" | "declined" | "tentative"
        }
      ]
    }
  ],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

### GET /api/events/range
**Headers:** `x-session-id: string`
**Query:** `?startDate=ISO_DATE&endDate=ISO_DATE&calendarId=string`

### GET /api/events/today
**Headers:** `x-session-id: string`

### GET /api/events/upcoming
**Headers:** `x-session-id: string`
**Query:** `?limit=number`

### POST /api/events
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "title": "string",
  "description": "string",
  "startTime": "ISO_DATE",
  "endTime": "ISO_DATE", 
  "isAllDay": boolean,
  "location": "string",
  "color": "string",
  "calendarId": "string",
  "isRecurring": boolean,
  "recurrenceRule": "string",
  "participants": [
    {
      "email": "string",
      "name": "string"
    }
  ]
}
```

### PUT /api/events/:id
**Headers:** `x-session-id: string`
**Request:** Same as POST (partial updates allowed)

### DELETE /api/events/:id
**Headers:** `x-session-id: string`

### PUT /api/events/:id/participants/:participantId
**Headers:** `x-session-id: string`
**Request:**
```json
{
  "status": "pending" | "accepted" | "declined" | "tentative"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "status": "string"
  },
  "message": "Participant status updated successfully"
}
```

---

## RRULE Patterns
- Daily: `FREQ=DAILY;INTERVAL=1`
- Weekly: `FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR`
- Monthly: `FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15`
- Yearly: `FREQ=YEARLY;INTERVAL=1;BYMONTH=12;BYMONTHDAY=25`

---

## Error Codes
- **401**: Unauthorized (missing/invalid session)
- **404**: Resource not found
- **409**: Conflict (duplicate email, etc.)
- **400**: Bad request (validation errors)
- **500**: Internal server error

---

## Frontend Integration

### Session Management
```javascript
// Store session after login
localStorage.setItem('sessionId', response.data.sessionId);

// Include in all API calls
headers: {
  'x-session-id': localStorage.getItem('sessionId'),
  'Content-Type': 'application/json'
}
```

### Date Handling
- All dates in ISO 8601 format: `2025-10-26T10:00:00.000Z`
- Frontend should handle timezone conversion
- Use user's timezone from profile for display

### Calendar Views
1. **Monthly**: Get events for month range
2. **Weekly**: Get events for week range  
3. **Daily**: Use `/api/events/today` or date range

### Event Creation Flow
1. Get user calendars: `GET /api/calendars`
2. Create event: `POST /api/events`
3. Refresh calendar view: `GET /api/events/range`

### Event Participants
- **Add participants**: Include `participants` array in event creation
- **RSVP responses**: Use `PUT /api/events/:id/participants/:participantId`
- **Status values**: `pending`, `accepted`, `declined`, `tentative`
- **Email invitations**: Backend handles participant notifications

This specification provides all endpoints needed for a complete Google Calendar clone frontend.