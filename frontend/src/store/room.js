import { create } from 'zustand';

export const useRoomStore = create((set, get) => ({
  rooms: [],
  loading: false,
  error: null,

  // Get JWT token from state or localStorage
  getToken: () => {
    const token = get().token;
    return token || localStorage.getItem('token');
  },

  getRooms: async () => {
    const token = get().getToken();
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      set({ rooms: data.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createRoom: async (roomData) => {
    const token = get().getToken();
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!res.ok) throw new Error('Failed to create room');
      const data = await res.json();

      set((state) => ({
        rooms: [...state.rooms, data.data],
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateRoom: async (id, roomData) => {
    const token = get().getToken();
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!res.ok) throw new Error('Failed to update room');
      const data = await res.json();

      set((state) => ({
        rooms: state.rooms.map((room) =>
          room._id === id ? { ...room, ...data.data } : room
        ),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  deleteRoom: async (id) => {
    const token = get().getToken();
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete room');

      set((state) => ({
        rooms: state.rooms.filter((room) => room._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
