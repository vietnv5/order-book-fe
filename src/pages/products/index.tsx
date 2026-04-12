import { useState, useMemo } from 'react';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import SkeletonList from '@/components/SkeletonList';
import EmptyState from '@/components/EmptyState';
import SearchBar from '@/components/SearchBar';
import BottomSheet from '@/components/BottomSheet';
import ConfirmDialog from '@/components/ConfirmDialog';
import ProductForm from '@/components/product/ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { useShop } from '@/contexts/ShopContext';
import { createProduct, updateProduct, deleteProduct } from '@/services/firestore/products';
import { Product } from '@/types';

export default function ProductsPage() {
  const { shopId } = useShop();
  const { products, loading } = useProducts();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  }, [products, search]);

  const handleCreate = async (data: Partial<Product>) => {
    if (!shopId) return;
    await createProduct(shopId, data as Omit<Product, 'uuid' | 'createdAt'>);
    setAddOpen(false);
  };

  const handleUpdate = async (data: Partial<Product>) => {
    if (!shopId || !editTarget) return;
    await updateProduct(shopId, editTarget.uuid, data);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!shopId || !deleteTarget) return;
    await deleteProduct(shopId, deleteTarget.uuid);
    setDeleteTarget(null);
  };

  return (
    <DefaultLayout>
      <AppHeader
        title="Sản phẩm"
        rightAction={
          <button onClick={() => setAddOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      <div className="px-4 py-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm tên, danh mục..." />
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          title={search ? 'Không tìm thấy' : 'Chưa có sản phẩm'}
          action={!search && <button onClick={() => setAddOpen(true)} className="btn-primary px-6">Thêm sản phẩm</button>}
        />
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-4">
          <p className="text-xs text-muted">{filtered.length} sản phẩm</p>
          {filtered.map((product) => (
            <div key={product.uuid} className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text truncate">{product.name}</p>
                  <div className="flex items-center gap-2">
                    {product.sellPrice != null && (
                      <p className="text-xs text-primary font-medium">{product.sellPrice.toLocaleString('vi')}đ</p>
                    )}
                    {product.unit && <p className="text-xs text-muted">/ {product.unit}</p>}
                    {product.category && <p className="text-xs text-muted truncate">• {product.category}</p>}
                  </div>
                </div>
              </div>
              <div className="ml-2 flex gap-1 shrink-0">
                <button onClick={() => setEditTarget(product)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => setDeleteTarget(product)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-danger">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Thêm sản phẩm">
        <ProductForm onSubmit={handleCreate} submitLabel="Thêm sản phẩm" />
      </BottomSheet>

      <BottomSheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Sửa sản phẩm">
        {editTarget && <ProductForm initial={editTarget} onSubmit={handleUpdate} submitLabel="Lưu thay đổi" />}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa sản phẩm?"
        message={`Sản phẩm "${deleteTarget?.name}" sẽ bị xóa.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DefaultLayout>
  );
}
