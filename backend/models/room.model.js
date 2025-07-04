import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },

  occupied: { 
    type: Boolean,
    default: false 
  },

  location: { 
    type: String, 
    required: true 
  },

  capacity: { 
    type: Number, 
    required: true 
  },

  imageUrl: { 
    type: String 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }

},{timestamps: true});

const Room = mongoose.model('Room', roomSchema);


export default Room;