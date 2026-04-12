import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { shop, loading: shopLoading } = useShop();

  if (authLoading || shopLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!shop) return <Navigate to="/setup" replace />;

  return <>{children}</>;
}
