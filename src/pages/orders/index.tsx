import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import OrderCard from '@/components/order/OrderCard';
import SkeletonList from '@/components/SkeletonList';
import EmptyState from '@/components/EmptyState';
import SearchBar from '@/components/SearchBar';
import { useOrders } from '@/hooks/useOrders';
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
  const [activeTab, setActiveTab] = useState<DeliveryStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const { orders, loading } = useOrders(activeTab);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  }, [orders, search]);

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

      {/* Status tabs */}
      <div className="scroll-tabs sticky top-14 z-30 bg-app pb-2 pt-3">
        {ALL_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-muted shadow-sm'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm theo tên, SĐT..." />
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
          title={search ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng'}
          description={search ? 'Thử từ khóa khác' : 'Nhấn + để tạo đơn hàng đầu tiên'}
          action={
            !search && (
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
            <OrderCard key={order.uuid} order={order} />
          ))}
        </div>
      )}
    </DefaultLayout>
  );
}
