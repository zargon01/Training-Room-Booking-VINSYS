import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

import userRoutes from './routes/user.route.js';
import roomRoutes from './routes/room.route.js';
import bookingRoutes from './routes/booking.route.js';
import mailRoutes from './routes/mail.route.js';
import statsRoutes from './routes/stats.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configure CORS fully before other middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://training.room.booking.s3-website.ap-south-1.amazonaws.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE',],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ✅ Ensure OPTIONS requests are handled (preflight)
app.options('*', cors());

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/stats", statsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  connectDB();
  console.log('Server started on:' + PORT);
});
