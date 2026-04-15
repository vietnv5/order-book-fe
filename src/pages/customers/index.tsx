import { useState, useMemo, useEffect } from 'react';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import SkeletonList from '@/components/SkeletonList';
import EmptyState from '@/components/EmptyState';
import SearchBar from '@/components/SearchBar';
import BottomSheet from '@/components/BottomSheet';
import ConfirmDialog from '@/components/ConfirmDialog';
import CustomerForm from '@/components/customer/CustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { useShop } from '@/contexts/ShopContext';
import { createCustomer, updateCustomer, deleteCustomer } from '@/services/firestore/customers';
import { computeCustomerStats } from '@/services/firestore/customerStats';
import { Customer, CustomerStatistics } from '@/types';

function formatMoney(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'k';
  return n.toString();
}

export default function CustomersPage() {
  const { shopId } = useShop();
  const { customers, loading } = useCustomers();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [statsMap, setStatsMap] = useState<Map<string, CustomerStatistics>>(new Map());
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    setStatsLoading(true);
    computeCustomerStats(shopId)
      .then(setStatsMap)
      .finally(() => setStatsLoading(false));
  }, [shopId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.sdt?.includes(q));
  }, [customers, search]);

  /** Check duplicate by name + phone (case-insensitive name) */
  const findDuplicate = (name: string, phone: string | undefined, excludeId?: string): Customer | undefined =>
    customers.find(
      (c) =>
        c.uuid !== excludeId &&
        c.name.toLowerCase() === name.toLowerCase() &&
        (phone ? c.sdt === phone : true),
    );

  const handleCreate = async (data: Partial<Customer>) => {
    if (!shopId) return;
    const dup = findDuplicate(data.name ?? '', data.sdt);
    if (dup) throw new Error(`Khách hàng “${dup.name}”${dup.sdt ? ' (' + dup.sdt + ')' : ''} đã tồn tại`);
    await createCustomer(shopId, data as Omit<Customer, 'uuid' | 'createdAt'>);
    setAddOpen(false);
  };

  const handleUpdate = async (data: Partial<Customer>) => {
    if (!shopId || !editTarget) return;
    const dup = findDuplicate(data.name ?? '', data.sdt, editTarget.uuid);
    if (dup) throw new Error(`Khách hàng “${dup.name}”${dup.sdt ? ' (' + dup.sdt + ')' : ''} đã tồn tại`);
    await updateCustomer(shopId, editTarget.uuid, data);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!shopId || !deleteTarget) return;
    await deleteCustomer(shopId, deleteTarget.uuid);
    setDeleteTarget(null);
  };

  return (
    <DefaultLayout>
      <AppHeader
        title="Khách hàng"
        rightAction={
          <button onClick={() => setAddOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      <div className="px-4 py-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm tên, SĐT..." />
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          title={search ? 'Không tìm thấy' : 'Chưa có khách hàng'}
          action={!search && <button onClick={() => setAddOpen(true)} className="btn-primary px-6">Thêm khách hàng</button>}
        />
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-4">
          <p className="text-xs text-muted">{filtered.length} khách hàng</p>
          {filtered.map((customer) => {
            const stats = statsMap.get(customer.uuid);
            return (
              <div key={customer.uuid} className="rounded-2xl bg-surface p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {customer.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text truncate">{customer.name}</p>
                      {customer.sdt && <p className="text-xs text-muted">{customer.sdt}</p>}
                      {customer.address && <p className="text-xs text-muted truncate">{customer.address}</p>}
                    </div>
                  </div>
                  <div className="ml-2 flex gap-1 shrink-0">
                    <button onClick={() => setEditTarget(customer)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteTarget(customer)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-danger">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Customer statistics */}
                {(stats || statsLoading) && (
                  <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3">
                    <div className="text-center">
                      <p className="text-xs text-muted">Đơn</p>
                      <p className="text-sm font-semibold text-text">{statsLoading ? '–' : (stats?.totalOrders ?? 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted">Chưa TT</p>
                      <p className="text-sm font-semibold text-amber-600">{statsLoading ? '–' : (stats?.unpaidOrders ?? 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted">Doanh thu</p>
                      <p className="text-sm font-semibold text-text">{statsLoading ? '–' : formatMoney(stats?.totalAmount ?? 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted">Còn nợ</p>
                      <p className={`text-sm font-semibold ${(stats?.totalDebt ?? 0) > 0 ? 'text-danger' : 'text-text'}`}>
                        {statsLoading ? '–' : formatMoney(stats?.totalDebt ?? 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Thêm khách hàng">
        <CustomerForm onSubmit={handleCreate} submitLabel="Thêm khách hàng" />
      </BottomSheet>

      <BottomSheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Sửa khách hàng">
        {editTarget && <CustomerForm initial={editTarget} onSubmit={handleUpdate} submitLabel="Lưu thay đổi" />}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa khách hàng?"
        message={`Khách hàng “${deleteTarget?.name}” sẽ bị xóa.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DefaultLayout>
  );
}
