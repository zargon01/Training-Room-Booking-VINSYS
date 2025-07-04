// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

/**
 * @param {ReactNode} children - Component to render if user is authorized.
 * @param {string[]} allowedRoles - Roles allowed to access this route.
 */
export default function PrivateRoute({ children, allowedRoles = [] }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role-based access check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
