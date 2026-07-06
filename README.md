# Task Tracker Application

A full-stack task management application with a .NET 10 backend, a React + TypeScript frontend, SQLite persistence, and JWT-based authentication.

## Overview

The application allows users to:
- register and log in securely
- create, view, update, and delete tasks
- assign tasks to themselves
- set due dates and track task status
- use a React-based dashboard and form workflow

## Architecture Overview

- Backend: ASP.NET Core Web API with controllers, repositories, DTOs, and EF Core with SQLite
- Frontend: React + TypeScript + Vite + React Router
- Authentication: JWT bearer tokens issued at login
- Data storage: SQLite database file stored in the backend project

## Setup Instructions

### Prerequisites

- .NET SDK 10.0 or newer
- Node.js 20.x or newer
- npm

### Backend Setup

1. Open a terminal in the backend folder:
   ```powershell
   cd Backend
   ```
2. Restore dependencies:
   ```powershell
   dotnet restore "./Task Tracker Application.slnx"
   ```
3. Build the backend:
   ```powershell
   dotnet build "./Task Tracker Application.slnx"
   ```
4. Run the API:
   ```powershell
   dotnet run --no-launch-profile --urls http://localhost:5074
   ```
5. Swagger UI will be available at:
   - http://localhost:5074/swagger

### Frontend Setup

1. Open a terminal in the frontend folder:
   ```powershell
   cd Frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```
4. Open the app at:
   - http://localhost:5173

### Environment Configuration

The backend reads configuration from the following files:
- Backend/appsettings.json
- Backend/appsettings.Development.json

The current default configuration includes:
- SQLite connection string
- JWT settings (issuer, audience, secret key, expiry)

Important values to review before production:
- JWT signing key
- CORS origins
- Allowed hosts

### Database Setup

The backend uses SQLite and creates the database automatically on startup.

Default behavior:
- database file: Backend/tasktracker.db
- EF Core ensures the schema exists
- an initial admin user is created if it does not exist

Default admin account:
- Email: admin@gmail.com
- Password: Admin123!

> For production use, change the admin password and JWT secret immediately.

## API Endpoints

### Authentication

- POST /api/users/login
  - Authenticates a user and returns a JWT token

### Users

- GET /api/users
- GET /api/users/{id}
- POST /api/users
- PUT /api/users/{id}
- DELETE /api/users/{id}

### Tasks

- GET /api/tasks
- GET /api/tasks/{id}
- POST /api/tasks
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}

All task routes require authentication via JWT bearer tokens.

## Design Decisions

### Architecture

The backend follows a clean-architecture-inspired structure with clear separation of concerns:
- Domain layer contains business entities such as users and tasks
- Application layer contains DTOs, interfaces, and use-case-oriented abstractions
- Infrastructure layer implements persistence and data access with EF Core and SQLite
- Presentation layer uses ASP.NET Core controllers to expose the API

This separation keeps the core domain logic decoupled from frameworks, persistence, and UI concerns.

### Key Implementation Decisions

- JWT authentication was chosen for stateless, bearer-token-based access control.
- SQLite was used for simplicity and local development portability.
- The frontend stores the JWT in browser storage after login and sends it in the Authorization header for protected requests.
- Swagger is enabled to simplify API exploration and manual testing.
- Task access is scoped to the authenticated user unless the user is an admin.

## Assumptions

- The project is intended for local development and lightweight deployment rather than large-scale enterprise use.
- SQLite is acceptable as the persistence layer for this application.
- A single admin account is sufficient for initial setup.
- The frontend and backend run locally on different ports during development.
- The JWT secret key in appsettings.json is acceptable for development only.

## Future Improvements

Possible enhancements with additional time:
- add password reset and email verification
- add proper role-based UI and permissions management
- add pagination, filtering, and sorting improvements on the frontend
- add unit and integration tests for controllers and repositories
- add Docker support for backend and frontend
- move secret configuration to environment variables or a secure secret store
- improve error handling and form validation across the app
