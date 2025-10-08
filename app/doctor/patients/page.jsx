'use client';
import { ProtectedRoute } from '../../../components/protected-route'; // 3 levels up
import { useAuth } from '../../../contexts/auth'; // 3 levels up

export default function DoctorDashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div>
        <h1>Doctor Dashboard</h1>
        <p>Welcome, {user?.username}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
