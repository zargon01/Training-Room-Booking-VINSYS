import { useEffect, useState } from 'react';
import { useRoomStore } from '../store/room';

import { useAuthStore } from '../store/auth';
import { useBookingStore } from '../store/booking';
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';
import { Clock, Home, User, X } from 'lucide-react';

export default function CreateBookingModal({ onClose }) {
  const { user } = useAuthStore();
  const { rooms, getRooms } = useRoomStore();
  const { createBooking, getBookings } = useBookingStore();

  const [formData, setFormData] = useState({
    userId: user?._id || '',
    roomId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const [userList, setUserList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRooms();
    if (user?.role === 'admin') fetchUsers();
  }, [getRooms, user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users?role=user');
      setUserList(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error('❌ End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    const res = await createBooking(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success('✅ Booking created successfully!');
      await getBookings();
      onClose(); // close modal
    } else {
      toast.error(res.message || '❌ Failed to create booking');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Create New Booking</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <div className="relative">
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select User</option>
                  {userList.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <div className="relative">
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.name} ({room.capacity} seats)
                  </option>
                ))}
              </select>
              <Home className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Meeting, Workshop, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <Clock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <Clock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
