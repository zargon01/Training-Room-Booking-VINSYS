import Booking from '../models/booking.model.js';
import mongoose from 'mongoose';
import { sendBookingStatusEmail } from '../utils/sendEmail.js';

// GET /api/bookings
export const getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { userId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('roomId', 'name location');

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.log('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  const { roomId, startTime, endTime, purpose } = req.body;

  if (!roomId || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Provide all fields.' });
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ success: false, message: 'End time must be after start time.' });
  }

  const userId = req.user.role === 'admin'
    ? req.body.userId || req.user._id
    : req.user._id;

  const newBooking = new Booking({ userId, roomId, startTime, endTime, purpose });

  try {
    const conflictingApprovedBooking = await Booking.findOne({
      roomId,
      status: 'approved',
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (conflictingApprovedBooking) {
      return res.status(409).json({
        success: false,
        message: 'The room is already approved for another booking during the selected time range.'
      });
    }

    await newBooking.save();
    res.status(201).json({ success: true, message: 'Booking created successfully', data: newBooking });

  } catch (error) {
    console.log('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status, reason, ...rest } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid booking ID' });
  }

  try {
    const booking = await Booking.findById(id).populate('userId').populate('roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const prevStatus = booking.status;

    // Check for overlapping approved booking if approving this one
    if (status === 'approved' && prevStatus !== 'approved') {
      const alreadyApproved = await Booking.findOne({
        _id: { $ne: booking._id },
        roomId: booking.roomId._id,
        status: 'approved',
        $or: [
          {
            startTime: { $lt: booking.endTime },
            endTime: { $gt: booking.startTime }
          }
        ]
      });

      if (alreadyApproved) {
        return res.status(409).json({
          success: false,
          message: 'Another approved booking already exists for this room and time range.'
        });
      }
    }

    // Apply updates
    Object.assign(booking, rest);
    if (status) booking.status = status;

    await booking.save();

    // Reject other pending bookings if this one is approved
    if (status === 'approved' && prevStatus !== 'approved') {
      const conflictingPending = await Booking.find({
        _id: { $ne: booking._id },
        roomId: booking.roomId._id,
        status: 'pending',
        $or: [
          {
            startTime: { $lt: booking.endTime },
            endTime: { $gt: booking.startTime }
          }
        ]
      }).populate('userId');

      // Reject and notify in parallel
      await Promise.all(
        conflictingPending.map(async (conflict) => {
          conflict.status = 'rejected';
          await conflict.save();
          await sendBookingStatusEmail({
            toEmail: conflict.userId.email,
            userName: conflict.userId.name,
            booking: conflict,
            status: 'rejected',
            reason: 'Another booking was approved for the same room and time slot.',
          });
        })
      );
    }

    // Notify user if status changed
    if ((status === 'approved' || status === 'rejected') && prevStatus !== status) {
      await sendBookingStatusEmail({
        toEmail: booking.userId.email,
        userName: booking.userId.name,
        booking,
        status,
        reason: status === 'rejected' ? reason : '',
      });
    }

    res.status(200).json({ success: true, message: 'Booking updated successfully', data: booking });
  } catch (error) {
    console.log('Error updating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid booking ID' });
  }

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this booking' });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.log('Error deleting booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const approveBooking = async (req, res) => {
  req.body.status = 'approved';
  return updateBooking(req, res);
};

export const rejectBooking = async (req, res) => {
  req.body.status = 'rejected';
  req.body.reason = req.body.reason || 'Rejected by admin.';
  return updateBooking(req, res);
};


// GET /api/bookings/pending
export const getPendingBookings = async (req, res) => {
  try {
    // Only admin can see all pending bookings
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to view pending bookings' 
      });
    }

    const pendingBookings = await Booking.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('roomId', 'name location');

    res.status(200).json({ 
      success: true, 
      data: pendingBookings 
    });
  } catch (error) {
    console.log('Error fetching pending bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};