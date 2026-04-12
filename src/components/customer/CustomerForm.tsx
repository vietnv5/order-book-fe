import { useState } from 'react';
import { Customer } from '@/types';

interface Props {
  initial?: Partial<Customer>;
  onSubmit: (data: Partial<Customer>) => Promise<void>;
  submitLabel?: string;
}

export default function CustomerForm({ initial, onSubmit, submitLabel = 'Lưu' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [sdt, setSdt] = useState(initial?.sdt ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Vui lòng nhập tên khách hàng'); return; }
    setError(''); setLoading(true);
    try {
      await onSubmit({ name: name.trim(), sdt: sdt.trim() || undefined, address: address.trim() || undefined, description: description.trim() || undefined, active: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Tên khách hàng <span className="text-danger">*</span></label>
        <input autoFocus className="input-field" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Số điện thoại</label>
        <input className="input-field" type="tel" placeholder="0912345678" value={sdt} onChange={(e) => setSdt(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Địa chỉ</label>
        <input className="input-field" placeholder="Địa chỉ..." value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Ghi chú</label>
        <textarea className="input-field resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  );
}
