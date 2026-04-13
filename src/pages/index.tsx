import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import SkeletonList from '@/components/SkeletonList';
import StatusBadge from '@/components/StatusBadge';
import ShopSwitcherSheet from '@/components/ShopSwitcherSheet';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/auth';
import { subscribeOrders } from '@/services/firestore/orders';
import { Order } from '@/types';

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (amount >= 1_000) return Math.round(amount / 1_000) + 'k';
  return amount.toString();
}

const today = new Date().toISOString().split('T')[0];

export default function DashboardPage() {
  const { shop, shopId, role } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShopSwitcher, setShowShopSwitcher] = useState(false);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    const unsub = subscribeOrders(shopId, (data) => {
      setAllOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [shopId]);

  const rangeOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const d = (o.statAt ?? o.createdAt ?? '').substring(0, 10);
      return d >= dateFrom && d <= dateTo;
    });
  }, [allOrders, dateFrom, dateTo]);

  const totalCount    = rangeOrders.length;
  const pendingCount  = rangeOrders.filter((o) => o.deliveryStatus === 'pending').length;
  const shippingCount = rangeOrders.filter((o) => o.deliveryStatus === 'shipping' || o.deliveryStatus === 'assigned').length;
  const revenue       = rangeOrders
    .filter((o) => o.deliveryStatus === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const isToday = dateFrom === today && dateTo === today;

  const statCards = [
    {
      label: isToday ? 'Đơn hôm nay' : 'Tổng đơn',
      value: totalCount,
      color: 'bg-indigo-50 text-indigo-600',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      label: 'Chờ xử lý',
      value: pendingCount,
      color: 'bg-amber-50 text-amber-600',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Đang giao',
      value: shippingCount,
      color: 'bg-blue-50 text-blue-600',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
    },
    {
      label: isToday ? 'Doanh thu HN' : 'Doanh thu',
      value: formatCurrency(revenue),
      color: 'bg-emerald-50 text-emerald-600',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
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
                <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-surface p-2 shadow-xl">
                  <p className="px-3 py-2 text-xs text-muted truncate">{user?.email}</p>
                  <hr className="border-border my-1" />
                  <button
                    onClick={() => { setShowShopSwitcher(true); setShowUserMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-text transition-colors active:bg-gray-100 dark:active:bg-slate-700"
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Chuyển / tham gia shop
                  </button>
                  {role === 'owner' && (
                    <button
                      onClick={() => { navigate('/shop/members'); setShowUserMenu(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-text transition-colors active:bg-gray-100 dark:active:bg-slate-700"
                    >
                      <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Quản lý thành viên
                    </button>
                  )}
                  <button
                    onClick={() => { navigate('/shippers'); setShowUserMenu(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-text transition-colors active:bg-gray-100 dark:active:bg-slate-700"
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Quản lý tài xế
                  </button>
                  <hr className="border-border my-1" />
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
        {/* Date range filter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-text">Thống kê</h2>
              {!isToday && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {dateFrom === dateTo
                    ? format(new Date(dateFrom), 'dd/MM/yyyy', { locale: vi })
                    : `${format(new Date(dateFrom), 'dd/MM', { locale: vi })} – ${format(new Date(dateTo), 'dd/MM/yyyy', { locale: vi })}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isToday && (
                <button
                  onClick={() => { setDateFrom(today); setDateTo(today); }}
                  className="text-xs font-medium text-primary"
                >
                  Hôm nay
                </button>
              )}
              <button
                onClick={() => setShowDateFilter((v) => !v)}
                aria-label="Lọc theo ngày"
                className={`flex h-8 w-8 items-center justify-center rounded-xl border-[1.5px] transition-all ${
                  showDateFilter || !isToday
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {showDateFilter && (
            <div className="mb-3 flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted">Từ ngày</label>
                <input
                  type="date"
                  className="input-field text-sm"
                  style={{ padding: '8px 12px' }}
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted">Đến ngày</label>
                <input
                  type="date"
                  className="input-field text-sm"
                  style={{ padding: '8px 12px' }}
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-text">{card.value}</p>
              <p className="text-xs text-muted mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-text">
            {isToday ? 'Đơn hàng hôm nay' : 'Đơn hàng trong kỳ'}
          </h2>
          <button onClick={() => navigate('/orders')} className="text-xs font-medium text-primary">
            Xem tất cả
          </button>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : rangeOrders.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
            <svg className="mx-auto mb-2 h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-muted">
              {isToday ? 'Chưa có đơn hàng hôm nay' : 'Không có đơn hàng trong khoảng này'}
            </p>
            {isToday && (
              <button onClick={() => navigate('/orders/new')} className="btn-primary mx-auto mt-4 w-auto px-6">
                Tạo đơn đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {rangeOrders.slice(0, 10).map((order) => (
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
                    {order.statAt || order.createdAt
                      ? format(new Date(order.statAt ?? order.createdAt), 'dd/MM', { locale: vi })
                      : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <ShopSwitcherSheet open={showShopSwitcher} onClose={() => setShowShopSwitcher(false)} />
    </DefaultLayout>
  );
}
