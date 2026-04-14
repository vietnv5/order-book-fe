import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

import LoginPage from '@/pages/login';
import SetupPage from '@/pages/setup';
import DashboardPage from '@/pages/index';
import OrdersPage from '@/pages/orders/index';
import NewOrderPage from '@/pages/orders/new';
import OrderDetailPage from '@/pages/orders/detail';
import CustomersPage from '@/pages/customers/index';
import ProductsPage from '@/pages/products/index';
import ShippersPage from '@/pages/shippers/index';
import MembersPage from '@/pages/shop/members';

function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/new"
        element={
          <ProtectedRoute>
            <NewOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:uuid"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shippers"
        element={
          <ProtectedRoute>
            <ShippersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/members"
        element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
    <PWAInstallBanner />
    </>
  );
}

export default App;
