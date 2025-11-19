import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminToken');
  const adminPin = localStorage.getItem('adminPin');

  if (!isAuthenticated || !adminPin) {
    // Redirect to login, saving the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
