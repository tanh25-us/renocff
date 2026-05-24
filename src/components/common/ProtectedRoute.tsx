import { Navigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useStore();
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
