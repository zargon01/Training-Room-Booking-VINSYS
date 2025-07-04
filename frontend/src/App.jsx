import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './index.css'

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/auth';

// Pages
import HomePage from './pages/HomePage';
import BookingsPage from './pages/BookingsPage';
import RoomsPage from './pages/RoomsPage';
import UsersPage from './pages/UsersPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';

function App() {
  const loadUserFromStorage = useAuthStore((state) => state.loadUserFromStorage);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const location = useLocation();

  // Determine if we're on the public homepage
  const isPublicHome = location.pathname === '/';

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  if (!hydrated) return <div>Loading...</div>;

  return (
    <>
      {/* Show Navbar only when user is logged in and not on the public homepage */}
      {!isPublicHome && user && <Navbar />}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
      />

      <div className="">
        <Routes>
          {/* ✅ Public route */}
          <Route path="/" element={<HomePage />} />

          {/* ✅ Protected routes (authenticated users only) */}
          <Route
            path="/bookings"
            element={
              <PrivateRoute allowedRoles={['admin', 'user']}>
                <BookingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <PrivateRoute allowedRoles={['admin', 'user']}>
                <RoomsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'user']}>
                <UserProfilePage />
              </PrivateRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <BookingsPage />
              </PrivateRoute>
            }
          />

          {/* User-only routes */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <BookingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/rooms"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <RoomsPage />
              </PrivateRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
