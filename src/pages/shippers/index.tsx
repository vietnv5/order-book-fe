import { useState } from 'react';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import SkeletonList from '@/components/SkeletonList';
import EmptyState from '@/components/EmptyState';
import BottomSheet from '@/components/BottomSheet';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useShippers } from '@/hooks/useShippers';
import { useShop } from '@/contexts/ShopContext';
import { createShipper, updateShipper, deleteShipper } from '@/services/firestore/shippers';
import { Shipper } from '@/types';

interface ShipperFormProps {
  initial?: Partial<Shipper>;
  onSubmit: (data: Partial<Shipper>) => Promise<void>;
  submitLabel?: string;
}

function ShipperForm({ initial, onSubmit, submitLabel = 'Lưu' }: ShipperFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Vui lòng nhập tên tài xế'); return; }
    setError(''); setLoading(true);
    try { await onSubmit({ name: name.trim(), phone: phone.trim() || undefined, active: true }); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Lỗi'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Tên tài xế <span className="text-danger">*</span></label>
        <input autoFocus className="input-field" placeholder="Tên tài xế..." value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Số điện thoại</label>
        <input className="input-field" type="tel" placeholder="0912..." value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  );
}

export default function ShippersPage() {
  const { shopId } = useShop();
  const { shippers, loading } = useShippers();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shipper | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shipper | null>(null);

  const handleCreate = async (data: Partial<Shipper>) => {
    if (!shopId) return;
    await createShipper(shopId, data as Omit<Shipper, 'uuid' | 'createdAt'>);
    setAddOpen(false);
  };

  const handleUpdate = async (data: Partial<Shipper>) => {
    if (!shopId || !editTarget) return;
    await updateShipper(shopId, editTarget.uuid, data);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!shopId || !deleteTarget) return;
    await deleteShipper(shopId, deleteTarget.uuid);
    setDeleteTarget(null);
  };

  return (
    <DefaultLayout>
      <AppHeader
        title="Tài xế giao hàng"
        showBack
        rightAction={
          <button onClick={() => setAddOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : shippers.length === 0 ? (
        <EmptyState
          icon={<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
          title="Chưa có tài xế"
          action={<button onClick={() => setAddOpen(true)} className="btn-primary px-6">Thêm tài xế</button>}
        />
      ) : (
        <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
          {shippers.map((shipper) => (
            <div key={shipper.uuid} className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text">{shipper.name}</p>
                  {shipper.phone && <p className="text-xs text-muted">{shipper.phone}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditTarget(shipper)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => setDeleteTarget(shipper)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-danger">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Thêm tài xế">
        <ShipperForm onSubmit={handleCreate} submitLabel="Thêm tài xế" />
      </BottomSheet>
      <BottomSheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Sửa tài xế">
        {editTarget && <ShipperForm initial={editTarget} onSubmit={handleUpdate} submitLabel="Lưu thay đổi" />}
      </BottomSheet>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tài xế?"
        message={`Tài xế "${deleteTarget?.name}" sẽ bị xóa.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DefaultLayout>
  );
}
