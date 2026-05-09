# CampusConnect

CampusConnect is a complete full-stack web application designed to streamline internship and job recruitment for university students. The platform provides a centralized environment where students can search and apply for opportunities, recruiters can post jobs and manage applicants, and administrators can supervise and maintain the system efficiently.

## Tech Stack

- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- File Upload: Multer (resume uploads)
- Session: express-session / JWT cookies
- Deployment: Render (backend) + Vercel (frontend)
- Version Control: GitHub

## Project Structure

```text
campusconnect/
  client/         # React + Vite frontend
  server/         # Express + MongoDB backend
```

## Backend Setup (`server/`)

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Configure environment variables in `server/.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT`
   - `CLIENT_URL`
3. Run backend in development:
   ```bash
   npm run dev
   ```

## Frontend Setup (`client/`)

1. Install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start Vite development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Server
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend with node

### Client
- `npm run dev` - Start frontend dev server
- `npm run build` - Create production build
- `npm run preview` - Preview production build

## Notes

- Backend runs on `http://localhost:5000` by default.
- Frontend runs on `http://localhost:5173` by default.
- CORS is configured to allow `CLIENT_URL` with credentials.
