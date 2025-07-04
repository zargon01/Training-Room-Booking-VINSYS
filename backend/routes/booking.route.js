import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import{getBookings, createBooking, updateBooking, deleteBooking, getPendingBookings, approveBooking, rejectBooking} from '../controllers/booking.controller.js';

const router = express.Router();
router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/pending', getPendingBookings);  // Add this new route
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/approve', approveBooking);
router.patch('/:id/reject', rejectBooking);

export default router;