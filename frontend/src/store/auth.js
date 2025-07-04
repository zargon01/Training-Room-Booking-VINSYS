import { create } from 'zustand';
import axios from '../utils/axiosInstance';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  error: null,
  hydrated: false, // ✅ hydration tracking

  // ✅ Login method
  login: async ({ email, password }) => {
    try {
      const res = await axios.post('/users/login', { email, password });
      const { user, token } = res.data;

      // ✅ Ensure token and user are valid before saving
      if (!user || !token) {
        throw new Error('Missing user or token in response');
      }

      // ✅ Save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      set({ user, token, error: null });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed';

      console.error('Login error:', message);
      set({ error: message, user: null, token: null });
      return { success: false };
    }
  },

  // ✅ Logout method
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  // ✅ Load from localStorage
  loadUserFromStorage: () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      // ✅ Only use if token is non-null and not "undefined"
      if (
        storedUser &&
        storedToken &&
        storedToken !== 'undefined'
      ) {
        set({
          user: JSON.parse(storedUser),
          token: storedToken,
          error: null,
          hydrated: true,
        });
      } else {
        set({ hydrated: true }); // no valid user/token
      }
    } catch (e) {
      console.error('Failed to restore auth state:', e);
      set({ hydrated: true }); // fallback
    }
  },
}));
