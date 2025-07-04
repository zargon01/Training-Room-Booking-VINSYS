import { useEffect, useState } from 'react';
import { useRoomStore } from "../store/room";
import { useAuthStore } from "../store/auth";
import { useBookingStore } from "../store/booking";
import { toast } from 'react-toastify';
import axios from '../utils/axiosInstance';
import { Calendar, Clock, Home, User, Check, X, Trash2, AlertCircle, Plus } from 'lucide-react';

export default function BookingsPage() {
  const { bookings = [], getBookings, createBooking, deleteBooking, updateBooking } = useBookingStore();
  const { rooms = [], getRooms } = useRoomStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    userId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const [userList, setUserList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    getBookings();
    getRooms();

    if (user?.role === 'user') {
      setFormData(prev => ({ ...prev, userId: user._id }));
    } else {
      fetchUsers();
    }
  }, [getBookings, getRooms, user]);

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
    const { startTime, endTime } = formData;

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('❌ End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    const res = await createBooking(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success('✅ Booking created successfully!');
      await getBookings();
      setFormData({
        userId: user?.role === 'user' ? user._id : '',
        roomId: '',
        startTime: '',
        endTime: '',
        purpose: ''
      });
      setShowCreateModal(false);
    } else {
      toast.error(res.message || '❌ Failed to create booking');
    }
  };

  const handleStatusChange = async (id, status) => {
    const res = await updateBooking(id, { status });
    if (res.success) {
      toast.success(`Booking ${status}`);
      await getBookings();
    } else {
      toast.error(res.message || 'Failed to update booking');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this booking?');
    if (!confirm) return;

    const res = await deleteBooking(id);
    if (res.success) {
      toast.success('Booking deleted');
      await getBookings();
    } else {
      toast.error(res.message || 'Failed to delete booking');
    }
  };

  const visibleBookings = user?.role === 'admin'
    ? bookings
    : bookings.filter(b => b.userId?._id === user._id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Booking
          </button>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              {user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={getBookings}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              </button>
            </div>
          </div>

          {visibleBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="mx-auto w-10 h-10 text-gray-400 mb-3" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleBookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.roomId?.name || 'Room Deleted'}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.userId?.name || 'User Deleted'} • {booking.userId?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(booking.startTime).toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(booking.endTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.purpose && (
                        <p className="text-sm text-gray-600 mt-1">Purpose: {booking.purpose}</p>
                      )}
                    </div>
                  </div>

                  {(user.role === 'admin' || booking.userId?._id === user._id) && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                      {user.role === 'admin' && booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'approved')}
                            className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'rejected')}
                            className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="flex items-center px-3 py-1 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Create New Booking</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <Clock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}