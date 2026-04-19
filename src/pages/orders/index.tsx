import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import OrderCard from '@/components/order/OrderCard';
import SkeletonList from '@/components/SkeletonList';
import EmptyState from '@/components/EmptyState';
import SearchBar from '@/components/SearchBar';
import { useOrders } from '@/hooks/useOrders';
import { useShop } from '@/contexts/ShopContext';
import { updateOrder } from '@/services/firestore/orders';
import { DeliveryStatus } from '@/types';

const ALL_TABS: Array<{ key: DeliveryStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'assigned', label: 'Giao tài xế' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const { shopId } = useShop();
  const [activeTab, setActiveTab] = useState<DeliveryStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const { orders, loading } = useOrders(activeTab);

  const handleUpdateStatus = async (uuid: string, status: DeliveryStatus) => {
    if (!shopId) return;
    await updateOrder(shopId, uuid, { deliveryStatus: status });
  };

  const handleUpdatePaid = async (uuid: string, paid: boolean) => {
    if (!shopId) return;
    await updateOrder(shopId, uuid, { paid });
  };

  const hasDateFilter = !!(dateFrom || dateTo);

  const filtered = useMemo(() => {
    let result = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone?.includes(q) ||
          o.description?.toLowerCase().includes(q),
      );
    }
    if (dateFrom) {
      result = result.filter((o) => {
        const d = (o.statAt ?? o.createdAt ?? '').substring(0, 10);
        return d >= dateFrom;
      });
    }
    if (dateTo) {
      result = result.filter((o) => {
        const d = (o.statAt ?? o.createdAt ?? '').substring(0, 10);
        return d <= dateTo;
      });
    }
    return result;
  }, [orders, search, dateFrom, dateTo]);

  const clearDateFilter = () => { setDateFrom(''); setDateTo(''); };

  return (
    <DefaultLayout>
      <AppHeader
        title="Đơn hàng"
        rightAction={
          <button onClick={() => navigate('/orders/new')} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      {/* Sticky controls */}
      <div className="sticky top-below-header z-30 bg-app">
        {/* Status tabs */}
        <div className="scroll-tabs pb-2 pt-3">
          {ALL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', boxShadow: '0 2px 8px rgba(139,92,246,.35)' } : undefined}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.key ? 'text-white' : 'bg-surface text-muted shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + date filter toggle */}
        <div className="flex items-center gap-2 px-4 pb-2">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo tên, SĐT..." />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDateFilter((v) => !v)}
              aria-label="Lọc theo ngày"
              className={`flex h-[46px] w-[46px] items-center justify-center rounded-xl border-[1.5px] transition-all ${
                showDateFilter || hasDateFilter
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-muted'
              }`}
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            {hasDateFilter && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-app" />
            )}
          </div>
        </div>

        {/* Date range inputs (collapsible) */}
        {showDateFilter && (
          <div className="flex items-end gap-2 px-4 pb-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted">Từ ngày</label>
              <input
                type="date"
                className="input-field text-sm"
                style={{ padding: '8px 12px' }}
                value={dateFrom}
                max={dateTo || undefined}
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
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                className="flex h-[38px] shrink-0 items-center gap-1 rounded-xl border-[1.5px] border-border bg-surface px-3 text-xs font-medium text-danger"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title={search || hasDateFilter ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng'}
          description={search || hasDateFilter ? 'Thử thay đổi bộ lọc' : 'Nhấn + để tạo đơn hàng đầu tiên'}
          action={
            !search && !hasDateFilter && (
              <button onClick={() => navigate('/orders/new')} className="btn-primary px-6">
                Tạo đơn mới
              </button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-4">
          <p className="text-xs text-muted">{filtered.length} đơn hàng</p>
          {filtered.map((order) => (
            <OrderCard
              key={order.uuid}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePaid={handleUpdatePaid}
            />
          ))}
        </div>
      )}
    </DefaultLayout>
  );
}
