import { create } from 'zustand';
import axios from '../utils/axiosInstance'; // ✅ Use the correct instance
import { useAuthStore } from './auth';

export const useBookingStore = create((set, get) => ({
  bookings: [],
  setBookings: (bookings) => set({ bookings }),

  createBooking: async (newBooking) => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, message: 'User not authenticated' };

    if (!newBooking.roomId || !newBooking.startTime || !newBooking.endTime) {
      return { success: false, message: 'Please provide all required fields.' };
    }

    try {
      const res = await axios.post('/bookings', newBooking);

      if (res.data?.success) {
        await get().getBookings();
        return { success: true, message: 'Booking created successfully' };
      } else {
        return {
          success: false,
          message: res.data?.message || 'Booking creation failed',
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Network error while creating booking',
      };
    }
  },

  getBookings: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const res = await axios.get('/bookings');

      if (res.data?.success) {
        set({ bookings: res.data.data });
      } else {
        console.error('Failed to fetch bookings:', res.data.message);
      }
    } catch (err) {
      console.error('Network error while fetching bookings:', err);
    }
  },

  deleteBooking: async (bid) => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, message: 'User not authenticated' };

    try {
      const res = await axios.delete(`/bookings/${bid}`);

      if (res.data?.success) {
        set((state) => ({
          bookings: state.bookings.filter((b) => b._id !== bid),
        }));
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message || 'Failed to delete booking.' };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Network error while deleting booking',
      };
    }
  },

  updateBooking: async (bid, updateBooking) => {
    const { user } = useAuthStore.getState();
    if (!user) return { success: false, message: 'User not authenticated' };

    try {
      const res = await axios.put(`/bookings/${bid}`, updateBooking);

      if (res.data?.success) {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b._id === bid ? { ...b, ...updateBooking } : b
          ),
        }));
        return { success: true, message: 'Booking updated successfully' };
      } else {
        return {
          success: false,
          message: res.data.message || 'Failed to update booking.',
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Network error while updating booking',
      };
    }
  },
}));
