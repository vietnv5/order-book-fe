import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import SkeletonList from '@/components/SkeletonList';
import StatusBadge from '@/components/StatusBadge';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/auth';
import { getOrdersOnce } from '@/services/firestore/orders';
import { Order } from '@/types';

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (amount >= 1_000) return Math.round(amount / 1_000) + 'k';
  return amount.toString();
}

export default function DashboardPage() {
  const { shop, shopId } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    getOrdersOnce(shopId).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [shopId]);

  const today = new Date().toISOString().split('T')[0];
  const todayCount = orders.filter((o) => o.createdAt?.startsWith(today)).length;
  const pendingCount = orders.filter((o) => o.deliveryStatus === 'pending').length;
  const shippingCount = orders.filter((o) => o.deliveryStatus === 'shipping' || o.deliveryStatus === 'assigned').length;
  const todayRevenue = orders
    .filter((o) => o.createdAt?.startsWith(today) && o.deliveryStatus === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const statCards = [
    { label: 'Đơn hôm nay', value: todayCount, icon: '📦', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Chờ xử lý', value: pendingCount, icon: '⏳', color: 'bg-amber-50 text-amber-600' },
    { label: 'Đang giao', value: shippingCount, icon: '🚚', color: 'bg-blue-50 text-blue-600' },
    { label: 'Doanh thu HN', value: formatCurrency(todayRevenue), icon: '💰', color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <DefaultLayout>
      <AppHeader
        title={shop?.name ?? 'Order Book'}
        rightAction={
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {user?.displayName?.[0] ?? 'U'}
                </span>
              )}
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-surface p-2 shadow-xl">
                  <p className="px-3 py-2 text-xs text-muted truncate">{user?.email}</p>
                  <hr className="border-border my-1" />
                  <button
                    onClick={() => { navigate('/shippers'); setShowUserMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-text"
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Quản lý tài xế
                  </button>
                  <button
                    onClick={async () => { await signOut(); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-danger"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />

      <div className="px-4 pt-4">
        {/* Stats grid */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-text">{card.value}</p>
              <p className="text-xs text-muted mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-text">Đơn hàng gần đây</h2>
          <button onClick={() => navigate('/orders')} className="text-xs font-medium text-primary">
            Xem tất cả
          </button>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm text-muted">Chưa có đơn hàng nào</p>
            <button onClick={() => navigate('/orders/new')} className="btn-primary mx-auto mt-4 w-auto px-6">
              Tạo đơn đầu tiên
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {orders.slice(0, 5).map((order) => (
              <button
                key={order.uuid}
                onClick={() => navigate(`/orders/${order.uuid}`)}
                className="flex items-start justify-between rounded-2xl bg-surface p-4 shadow-card text-left transition-all active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text truncate">{order.customerName}</p>
                  {order.customerPhone && (
                    <p className="mt-0.5 text-xs text-muted">{order.customerPhone}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={order.deliveryStatus} size="sm" />
                    {order.paid && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Đã TT
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3 text-right shrink-0">
                  {order.totalAmount != null && (
                    <p className="font-semibold text-text text-sm">
                      {order.totalAmount.toLocaleString('vi')}đ
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted">
                    {order.createdAt
                      ? format(new Date(order.createdAt), 'dd/MM', { locale: vi })
                      : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
