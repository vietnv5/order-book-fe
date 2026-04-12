import { useState } from 'react';
import { Product } from '@/types';

interface Props {
  initial?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  submitLabel?: string;
}

export default function ProductForm({ initial, onSubmit, submitLabel = 'Lưu' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [sellPrice, setSellPrice] = useState(String(initial?.sellPrice ?? ''));
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Vui lòng nhập tên sản phẩm'); return; }
    setError(''); setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        unit: unit.trim() || undefined,
        sellPrice: sellPrice ? Number(sellPrice) : undefined,
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        active: true,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Tên sản phẩm <span className="text-danger">*</span></label>
        <input autoFocus className="input-field" placeholder="Tên sản phẩm..." value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Đơn vị</label>
          <input className="input-field" placeholder="cái, hộp, kg..." value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Giá bán</label>
          <input type="number" min="0" className="input-field" placeholder="0" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Danh mục</label>
        <input className="input-field" placeholder="Danh mục sản phẩm..." value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Mô tả</label>
        <textarea className="input-field resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  );
}
