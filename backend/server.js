import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cors from 'cors';

import userRoutes from './routes/user.route.js';
import roomRoutes from './routes/room.route.js';
import bookingRoutes from './routes/booking.route.js';
import mailRoutes from './routes/mail.route.js';
import statsRoutes from './routes/stats.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://3.109.121.179', 'http://your-frontend-domain'],
  credentials: true
}));


app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/stats", statsRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log('Server started on:' + PORT);
});
