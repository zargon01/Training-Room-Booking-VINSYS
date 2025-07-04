import { create } from 'zustand';

export const useUserStore = create((set, get) => ({
  user: null,
  token: null,
  users: [],
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  loadFromStorage: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        set({ user: JSON.parse(storedUser), token: storedToken });
      } catch (err) {
        console.error('Error loading auth data:', err);
      }
    }
  },

  getUsers: async () => {
    const token = get().token;
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      set({ users: data.data });
    } catch (err) {
      set({ error: 'Failed to fetch users.',err });
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (newUser) => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      return { success: false, message: 'Provide all fields.' };
    }
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      await get().getUsers(); // refresh list
      return { success: true, message: 'User created successfully' };
    } catch (err) {
      set({ error: 'Failed to create user.' });
      return { success: false, message: 'Error creating user',err };
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (userId) => {
    const token = get().token;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      await get().getUsers(); // refresh list
      return { success: true, message: data.message };
    } catch (err) {
      set({ error: 'Failed to delete user.' });
      return { success: false, message: 'Error deleting user',err };
    } finally {
      set({ loading: false });
    }
  },

  showUser: async (userId) => {
    const token = get().token;
    const res = await fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    set({ user: data.data });
  },

  updateUser: async (userId, updateUser) => {
    const token = get().token;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateUser),
      });

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? data.data : user
        ),
        user:
          state.user && state.user._id === userId
            ? { ...state.user, ...data.data }
            : state.user,
      }));

      return { success: true, message: 'User updated successfully' };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, message: 'Error updating user' };
    }
  },

  loginUser: async (email, password) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // ✅ store JWT
      set({ user: data.user, token: data.token });

      return { success: true, message: 'Login successful' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Login failed due to server error' };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
