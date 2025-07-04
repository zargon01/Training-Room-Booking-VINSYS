import Room from '../models/room.model.js';
import mongoose from 'mongoose';

export const getRoom = async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    console.log('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const createRoom = async (req, res) => {
  const rooms = req.body;

  if (!rooms.name || !rooms.location || !rooms.capacity) {
    return res.status(400).json({ success: false, message: 'Provide all fields.' });
  }

  const newRoom = new Room(rooms);

  try {
    await newRoom.save();
    res.status(201).json({ success: true, message: 'Room created successfully', data: newRoom });
  } catch (error) {
    console.log('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const roomData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid room ID' });
  }

  try {
    const updatedRoom = await Room.findByIdAndUpdate(id, roomData, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, message: 'Room updated successfully', data: updatedRoom });
  } catch (error) {
    console.log('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid room ID' });
  }

  try {
    await Room.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.log('Error deleting room:', error);
    res.status(404).json({ success: false, message: 'Room not found' });
  }
}
