import mongoose from 'mongoose';



const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true },

  startTime: { 
    type: Date, 
    required: true 
  },

  endTime: { 
    type: Date, 
    required: true 
  },

  purpose: { type: String },

  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  },{timestamps: true});

bookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 }); // For conflict checking

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;