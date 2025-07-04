import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import userRoutes from './routes/user.route.js';
import roomRoutes from './routes/room.route.js';
import bookingRoutes from './routes/booking.route.js';
import mailRoutes from './routes/mail.route.js';
import statsRoutes from './routes/stats.routes.js'; // ✅ Add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/stats", statsRoutes); // ✅ Register the route

app.listen(PORT, () => {
  connectDB();
  console.log('Server started on http://localhost:' + PORT);
});
