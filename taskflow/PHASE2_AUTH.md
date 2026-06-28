# TaskFlow Phase 2 Authentication

## Folder Structure

```text
taskflow/
  client/
    src/
      components/
        Navbar.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
      pages/
        Dashboard.jsx
        Login.jsx
        NotFound.jsx
        Register.jsx
      routes/
        AppRoutes.jsx
      services/
        api.js
        authService.js
      App.jsx
      main.jsx
  server/
    config/
      db.js
    controllers/
      authController.js
    middleware/
      authMiddleware.js
    models/
      User.js
    routes/
      authRoutes.js
    utils/
      generateToken.js
    server.js
    .env.example
```

## Install Commands

```bash
cd taskflow/client
npm install

cd ../server
npm install
```

## Run Commands

```bash
cd taskflow/client
npm run dev
```

```bash
cd taskflow/server
npm run dev
```

## Environment Variables

Create `taskflow/server/.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
```

## MongoDB Atlas Setup

1. Create or open a MongoDB Atlas project.
2. Create a free or dedicated cluster.
3. Add a database user from Database Access.
4. Add your IP address from Network Access.
5. Click Connect, choose Drivers, and copy the Node.js connection string.
6. Replace `<password>` and database name in the URI.
7. Paste the final URI into `server/.env` as `MONGO_URI`.

## API Routes

Base URL: `http://localhost:5000`

### Health Check

`GET /`

Response:

```json
{
  "message": "TaskFlow API Running",
  "database": "connected"
}
```

### Register

`POST /api/auth/register`

Body:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

### Login

`POST /api/auth/login`

Body:

```json
{
  "email": "alex@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

### Current User

`GET /api/auth/me`

Header:

```text
Authorization: Bearer jwt-token
```

Success response:

```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

## Postman Testing Flow

1. Send `GET http://localhost:5000/` and confirm the API health response.
2. Send `POST http://localhost:5000/api/auth/register` with name, email, and password.
3. Copy the returned token.
4. Send `GET http://localhost:5000/api/auth/me` with `Authorization: Bearer <token>`.
5. Send `POST http://localhost:5000/api/auth/login` with the same email and password.
6. Test invalid credentials and missing token cases to confirm `success:false` error responses.

## Verification Checklist

- MongoDB connection is reusable and retries automatically if the initial connection fails.
- User schema includes name, email, password, and timestamps.
- Passwords are hashed with bcrypt before storage.
- JWT tokens are signed with `JWT_SECRET` and expire in 7 days.
- `/api/auth/me` is protected by Bearer token middleware.
- React stores the JWT in localStorage and reloads user state on refresh.
- Dashboard route is protected and redirects unauthenticated users to login.
- Login and register forms validate input and show API errors.
