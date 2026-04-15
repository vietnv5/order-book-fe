import { useState, useEffect, useMemo } from 'react';
import { Order, DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useShippers } from '@/hooks/useShippers';
import { findOrCreateProduct } from '@/services/firestore/products';
import OrderItemRow, { OrderItemDraft } from './OrderItemRow';

interface Props {
  shopId?: string;
  initial?: Partial<Order>;
  initialItems?: OrderItemDraft[];
  onSubmit: (order: Partial<Order>, items: OrderItemDraft[]) => Promise<void>;
  submitLabel?: string;
}

export default function OrderForm({ shopId, initial, initialItems, onSubmit, submitLabel = 'Lưu đơn' }: Props) {
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
  const [totalAmountInput, setTotalAmountInput] = useState(String(initial?.totalAmount ?? ''));

  // Auto-calculate total when all items have prices set
  const computedTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * (i.sellPrice || 0), 0),
    [items],
  );
  const allItemsPriced = items.length > 0 && items.every((i) => (i.sellPrice || 0) > 0);

  useEffect(() => {
    if (allItemsPriced) {
      setTotalAmountInput(String(computedTotal));
    }
  }, [computedTotal, allItemsPriced]);

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
    if (!customerName.trim()) {
      setError('Vui lòng nhập tên khách hàng');
      document.getElementById('customer-name')?.focus();
      return;
    }
    setError(''); setLoading(true);
    try {
      // Filter items that have either a product selected or a new name typed
      let resolvedItems = items.filter((i) => i.productId || i.productName.trim());

      // Auto-create products for items with a typed name but no productId
      if (shopId) {
        resolvedItems = await Promise.all(
          resolvedItems.map(async (i) => {
            if (!i.productId && i.productName.trim()) {
              const product = await findOrCreateProduct(shopId, i.productName);
              return { ...i, productId: product.uuid, productName: product.name };
            }
            return i;
          }),
        );
      }

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
        totalAmount: totalAmountInput ? Number(totalAmountInput) : undefined,
        source: initial?.source ?? 'manual',
      }, resolvedItems);
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
        <label htmlFor="customer-name" className="mb-1.5 block text-sm font-medium text-text">
          Khách hàng <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="customer-name"
            required
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'customer-error' : undefined}
            className="input-field"
            placeholder="Tên khách hàng hoặc tìm trong danh sách..."
            value={showCustomerList ? customerSearch : customerName}
            onChange={(e) => {
              const val = e.target.value;
              setCustomerId('');
              if (showCustomerList) {
                setCustomerSearch(val);
                setCustomerName(val);
              } else {
                setCustomerName(val);
              }
            }}
            onFocus={() => {
              setCustomerSearch(customerName);
              setShowCustomerList(true);
            }}
            onBlur={() => setTimeout(() => setShowCustomerList(false), 150)}
          />
          {showCustomerList && (
            <div
              role="listbox"
              aria-label="Danh sách khách hàng"
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg"
            >
              {filteredCustomers.slice(0, 8).map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  role="option"
                  aria-selected={c.uuid === customerId}
                  onMouseDown={() => handleCustomerSelect(c)}
                  className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-600 border-b border-border last:border-0"
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
                onMouseDown={() => {
                  if (customerSearch.trim()) {
                    setCustomerName(customerSearch.trim());
                    setCustomerId('');
                  }
                  setShowCustomerList(false);
                }}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-primary hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-600"
              >
                Dùng tên vừa nhập
              </button>
            </div>
          )}
        </div>
        {error && (
          <p id="customer-error" role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      {/* Phone & Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="customer-phone" className="mb-1.5 block text-sm font-medium text-text">Số điện thoại</label>
          <input
            id="customer-phone"
            type="tel"
            autoComplete="tel"
            className="input-field"
            placeholder="0912..."
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="stat-at" className="mb-1.5 block text-sm font-medium text-text">Ngày đặt</label>
          <input
            id="stat-at"
            type="date"
            className="input-field"
            value={statAt}
            onChange={(e) => setStatAt(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="customer-address" className="mb-1.5 block text-sm font-medium text-text">Địa chỉ giao</label>
        <input
          id="customer-address"
          autoComplete="street-address"
          className="input-field"
          placeholder="Địa chỉ giao hàng..."
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
        />
      </div>

      {/* Order Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-text">Sản phẩm</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm font-medium text-primary touch-action-manipulation">
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
            <button type="button" onClick={addItem} className="rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted w-full active:bg-slate-50 dark:active:bg-slate-800">
              + Thêm sản phẩm
            </button>
          )}
        </div>
      </div>

      {/* Total amount */}
      <div>
        <label htmlFor="total-amount" className="mb-1.5 block text-sm font-medium text-text">
          Tổng tiền hàng
          {allItemsPriced && (
            <span className="ml-1.5 text-xs font-normal text-success">● tự tính từ sản phẩm</span>
          )}
        </label>
        <input
          id="total-amount"
          type="number"
          min="0"
          inputMode="numeric"
          className="input-field"
          placeholder="0"
          value={totalAmountInput}
          onChange={(e) => setTotalAmountInput(e.target.value)}
        />
      </div>

      {/* Delivery */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="delivery-status" className="mb-1.5 block text-sm font-medium text-text">Trạng thái</label>
          <select
            id="delivery-status"
            className="input-field"
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
          >
            {(Object.entries(DELIVERY_STATUS_LABELS) as [DeliveryStatus, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="delivery-fee" className="mb-1.5 block text-sm font-medium text-text">Phí giao</label>
          <input
            id="delivery-fee"
            type="number"
            min="0"
            inputMode="numeric"
            className="input-field"
            placeholder="0"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />
        </div>
      </div>

      {shippers.length > 0 && (
        <div>
          <label htmlFor="shipper" className="mb-1.5 block text-sm font-medium text-text">Tài xế</label>
          <select
            id="shipper"
            className="input-field"
            value={shipperId}
            onChange={(e) => setShipperId(e.target.value)}
          >
            <option value="">-- Chưa chọn --</option>
            {shippers.map((s) => <option key={s.uuid} value={s.uuid}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text">Ghi chú</label>
        <textarea
          id="description"
          className="input-field resize-none"
          rows={2}
          placeholder="Ghi chú đơn hàng..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Paid toggle */}
      <label className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-card cursor-pointer">
        <span id="paid-label" className="text-sm font-medium text-text">Đã thanh toán</span>
        <button
          type="button"
          role="switch"
          aria-checked={paid}
          aria-labelledby="paid-label"
          onClick={() => setPaid((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${paid ? 'bg-success' : 'bg-gray-200 dark:bg-slate-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${paid ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang lưu...
          </>
        ) : submitLabel}
      </button>
    </div>
  );
}
