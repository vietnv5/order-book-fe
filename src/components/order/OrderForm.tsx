import { useState } from 'react';
import { Order, DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useShippers } from '@/hooks/useShippers';
import OrderItemRow, { OrderItemDraft } from './OrderItemRow';

interface Props {
  initial?: Partial<Order>;
  initialItems?: OrderItemDraft[];
  onSubmit: (order: Partial<Order>, items: OrderItemDraft[]) => Promise<void>;
  submitLabel?: string;
}

export default function OrderForm({ initial, initialItems, onSubmit, submitLabel = 'Lưu đơn' }: Props) {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { shippers } = useShippers();

  const [customerName, setCustomerName] = useState(initial?.customerName ?? '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone ?? '');
  const [customerAddress, setCustomerAddress] = useState(initial?.customerAddress ?? '');
  const [customerId, setCustomerId] = useState(initial?.customerId ?? '');
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(initial?.deliveryStatus ?? 'pending');
  const [shipperId, setShipperId] = useState(initial?.shipperId ?? '');
  const [deliveryFee, setDeliveryFee] = useState(String(initial?.deliveryFee ?? ''));
  const [paid, setPaid] = useState(initial?.paid ?? false);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [statAt, setStatAt] = useState(
    initial?.statAt ? initial.statAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
  );
  const [items, setItems] = useState<OrderItemDraft[]>(initialItems ?? []);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.sellPrice, 0);

  const handleCustomerSelect = (c: { uuid: string; name: string; sdt?: string; address?: string }) => {
    setCustomerId(c.uuid);
    setCustomerName(c.name);
    if (c.sdt) setCustomerPhone(c.sdt);
    if (c.address) setCustomerAddress(c.address);
    setShowCustomerList(false);
    setCustomerSearch('');
  };

  const addItem = () => setItems((prev) => [...prev, { productId: '', productName: '', quantity: 1, sellPrice: 0, unit: '' }]);
  const updateItem = (i: number, item: OrderItemDraft) => setItems((prev) => prev.map((x, idx) => idx === i ? item : x));
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!customerName.trim()) { setError('Vui lòng nhập tên khách hàng'); return; }
    setError(''); setLoading(true);
    try {
      await onSubmit({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        customerId: customerId || undefined,
        deliveryStatus,
        shipperId: shipperId || undefined,
        deliveryFee: deliveryFee ? Number(deliveryFee) : undefined,
        paid,
        description: description.trim() || undefined,
        statAt: statAt ? new Date(statAt).toISOString() : undefined,
        totalAmount,
        source: initial?.source ?? 'manual',
      }, items.filter((i) => i.productId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.sdt && c.sdt.includes(customerSearch)),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Customer */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Khách hàng <span className="text-danger">*</span></label>
        <div className="relative">
          <input
            className="input-field"
            placeholder="Tên khách hàng hoặc tìm trong danh sách..."
            value={showCustomerList ? customerSearch : customerName}
            onChange={(e) => {
              if (showCustomerList) setCustomerSearch(e.target.value);
              else { setCustomerName(e.target.value); setCustomerId(''); }
            }}
            onFocus={() => setShowCustomerList(true)}
          />
          {showCustomerList && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
              {filteredCustomers.slice(0, 8).map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onMouseDown={() => handleCustomerSelect(c)}
                  className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-gray-50 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium text-text">{c.name}</span>
                  {c.sdt && <span className="text-xs text-muted">{c.sdt}</span>}
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted">Không tìm thấy</p>
              )}
              <button
                type="button"
                onMouseDown={() => { setShowCustomerList(false); }}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-primary"
              >
                Dùng tên vừa nhập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phone & Address */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Số điện thoại</label>
          <input className="input-field" placeholder="0912..." value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Ngày đặt</label>
          <input type="date" className="input-field" value={statAt} onChange={(e) => setStatAt(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Địa chỉ giao</label>
        <input className="input-field" placeholder="Địa chỉ giao hàng..." value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
      </div>

      {/* Order Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-text">Sản phẩm</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm font-medium text-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Thêm
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <OrderItemRow key={i} item={item} index={i} products={products} onChange={updateItem} onRemove={removeItem} />
          ))}
          {items.length === 0 && (
            <button type="button" onClick={addItem} className="rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted w-full">
              + Thêm sản phẩm
            </button>
          )}
        </div>
        {totalAmount > 0 && (
          <p className="mt-2 text-right text-sm font-semibold text-text">
            Tổng: {totalAmount.toLocaleString('vi')}đ
          </p>
        )}
      </div>

      {/* Delivery */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Trạng thái</label>
          <select className="input-field" value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}>
            {(Object.entries(DELIVERY_STATUS_LABELS) as [DeliveryStatus, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Phí giao</label>
          <input type="number" min="0" className="input-field" placeholder="0" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
        </div>
      </div>

      {shippers.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">Tài xế</label>
          <select className="input-field" value={shipperId} onChange={(e) => setShipperId(e.target.value)}>
            <option value="">-- Chưa chọn --</option>
            {shippers.map((s) => <option key={s.uuid} value={s.uuid}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text">Ghi chú</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Ghi chú đơn hàng..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Paid toggle */}
      <label className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-card">
        <span className="text-sm font-medium text-text">Đã thanh toán</span>
        <button
          type="button"
          onClick={() => setPaid((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${paid ? 'bg-success' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${paid ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  );
}
