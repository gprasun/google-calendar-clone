# Google Calendar Clone - Backend API

A high-fidelity backend API for a Google Calendar clone built with Node.js, TypeScript, Express, and Prisma.

## Features

- **Authentication & Authorization**: Session authentication with secure password hashing
- **User Management**: Complete user profile management with timezone support
- **Calendar Management**: Create, update, delete, and share calendars
- **Event Management**: Full CRUD operations for events with recurring support
- **Event Sharing**: Invite participants and manage RSVPs
- **Recurring Events**: Support for complex recurring event patterns
- **Repository Pattern**: Clean separation between business logic and data access
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Security**: Rate limiting, CORS, helmet security headers
- **Database**: PostgreSQL with Prisma ORM
- **ORM Flexibility**: Easy migration between different ORMs or raw SQL

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Architecture**: Repository Pattern (DAO)
- **Authentication**: Session Auth
- **Security**: bcryptjs, helmet, cors
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/calendar_db?schema=public"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   
   # CORS
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account
- `POST /api/auth/logout` - Logout user

### Calendar Management
- `POST /api/calendars` - Create a new calendar
- `GET /api/calendars` - Get user's calendars
- `GET /api/calendars/:id` - Get calendar by ID
- `PUT /api/calendars/:id` - Update calendar
- `DELETE /api/calendars/:id` - Delete calendar
- `POST /api/calendars/:id/share` - Share calendar
- `GET /api/calendars/:id/shares` - Get calendar shares
- `PUT /api/calendars/:id/shares/:shareId` - Update share permissions
- `DELETE /api/calendars/:id/shares/:shareId` - Remove calendar share

### Event Management
- `POST /api/events` - Create a new event
- `GET /api/events` - Get events with filtering
- `GET /api/events/range` - Get events in date range
- `GET /api/events/today` - Get today's events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PUT /api/events/:id/participants/:participantId` - Update participant status

## Architecture

### Repository Pattern Implementation

The backend uses a Repository/DAO pattern that provides:

- **Clean Separation**: Business logic is separated from data access logic
- **Testability**: Easy to mock repositories for unit testing
- **Flexibility**: Can switch between different ORMs or raw SQL without changing business logic
- **Maintainability**: Centralized data access logic
- **Consistency**: Standardized interface for all data operations

### Database Schema

### Users
- User authentication and profile information
- Timezone support for proper event display

### Calendars
- Multiple calendars per user
- Calendar sharing with role-based permissions
- Color coding and customization

### Events
- Full event details with location and description
- Recurring event support with RRULE format
- Event participants and RSVP management


### Calendar Shares
- Role-based access control (viewer, editor, owner)
- Secure calendar sharing between users

## Recurring Events

The system supports complex recurring event patterns using RRULE format:

- **Daily**: `FREQ=DAILY;INTERVAL=1`
- **Weekly**: `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR`
- **Monthly**: `FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15`
- **Yearly**: `FREQ=YEARLY;INTERVAL=1;BYMONTH=12;BYMONTHDAY=25`

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent abuse with request rate limiting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "error details"
}
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set up proper CORS origins
4. Set up monitoring and logging