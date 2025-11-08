# FitZone Backend Server

A comprehensive fitness tracking backend built with Node.js, Express, and MongoDB.

## Features

### User Management
- User registration with email verification (OTP)
- Secure login/logout
- Profile management with fitness goals
- Password reset functionality

### Admin Panel
- Admin authentication
- User management
- Workout plan creation and management
- Nutrition plan creation and management
- Dashboard with analytics

### Workout Management
- Create, read, update, delete workout plans
- Exercise tracking with sets, reps, and weights
- Categorized workouts (strength, cardio, flexibility, etc.)
- Difficulty levels (beginner, intermediate, advanced)

### Nutrition Management
- Meal planning with nutritional information
- Calorie and macro tracking
- Goal-based nutrition plans
- Recipe management with ingredients and instructions

### Progress Tracking
- Workout logging and history
- Nutrition logging
- Body measurements tracking
- Goal setting and achievement system
- Progress photos

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
MONGO_URL=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FitZone <your_email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

3. Create admin user:
```bash
node scripts/createAdmin.mjs
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `DELETE /api/admin/users/:id` - Delete user

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get workout by ID
- `POST /api/workouts` - Create workout (Admin)
- `PUT /api/workouts/:id` - Update workout (Admin)
- `DELETE /api/workouts/:id` - Delete workout (Admin)

### Nutrition
- `GET /api/nutrition` - Get all nutrition plans
- `GET /api/nutrition/:id` - Get nutrition plan by ID
- `POST /api/nutrition` - Create nutrition plan (Admin)
- `PUT /api/nutrition/:id` - Update nutrition plan (Admin)
- `DELETE /api/nutrition/:id` - Delete nutrition plan (Admin)

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/workout` - Log workout
- `POST /api/progress/nutrition` - Log nutrition
- `POST /api/progress/measurements` - Log body measurements
- `PUT /api/progress/goals` - Update goals

## Default Admin Credentials
- Email: admin@fitzone.com
- Password: admin123

## Technologies Used
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email services
- Multer for file uploads

## Project Structure
```
server/
├── Models/           # Database models
├── Routes/           # API routes
├── Services/         # Email and other services
├── middleware/       # Authentication middleware
├── scripts/          # Utility scripts
├── uploads/          # File uploads directory
├── server.mjs        # Main server file
└── package.json      # Dependencies
```