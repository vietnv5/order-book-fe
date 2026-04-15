import { Product } from '@/types';

export interface OrderItemDraft {
  productId: string;
  productName: string;
  quantity: number;
  unit?: string;
  sellPrice: number;
}

interface Props {
  item: OrderItemDraft;
  index: number;
  products: Product[];
  onChange: (index: number, item: OrderItemDraft) => void;
  onRemove: (index: number) => void;
}

export default function OrderItemRow({ item, index, products, onChange, onRemove }: Props) {
  const product = products.find((p) => p.uuid === item.productId);
  const rowId = `item-${index}`;

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <label htmlFor={`${rowId}-product`} className="sr-only">Sản phẩm {index + 1}</label>
          <select
            id={`${rowId}-product`}
            className="input-field mb-2 text-sm"
            value={item.productId}
            onChange={(e) => {
              if (!e.target.value) {
                onChange(index, { ...item, productId: '', productName: '' });
                return;
              }
              const p = products.find((x) => x.uuid === e.target.value);
              if (p) onChange(index, {
                ...item,
                productId: p.uuid,
                productName: p.name,
                unit: p.unit ?? '',
                sellPrice: p.sellPrice ?? 0,
              });
            }}
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((p) => (
              <option key={p.uuid} value={p.uuid}>{p.name}</option>
            ))}
          </select>
          {item.productId === '' && (
            <input
              id={`${rowId}-new-product`}
              className="input-field mb-2 text-sm"
              placeholder="Nhập tên sản phẩm mới..."
              value={item.productName}
              onChange={(e) => onChange(index, { ...item, productName: e.target.value })}
            />
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor={`${rowId}-qty`} className="text-xs text-muted">Số lượng</label>
              <input
                id={`${rowId}-qty`}
                type="number"
                min="1"
                inputMode="numeric"
                className="input-field py-2 text-sm"
                value={item.quantity}
                onChange={(e) => onChange(index, { ...item, quantity: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`${rowId}-unit`} className="text-xs text-muted">Đơn vị</label>
              <input
                id={`${rowId}-unit`}
                className="input-field py-2 text-sm"
                placeholder={product?.unit ?? 'cái'}
                value={item.unit ?? ''}
                onChange={(e) => onChange(index, { ...item, unit: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`${rowId}-price`} className="text-xs text-muted">Giá bán</label>
              <input
                id={`${rowId}-price`}
                type="number"
                min="0"
                inputMode="numeric"
                className="input-field py-2 text-sm"
                value={item.sellPrice}
                onChange={(e) => onChange(index, { ...item, sellPrice: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Xóa sản phẩm ${index + 1}${item.productName ? ': ' + item.productName : ''}`}
          className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-danger active:bg-red-50 dark:active:bg-red-950"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="mt-1 text-right text-xs font-medium text-primary">
        = {(item.quantity * item.sellPrice).toLocaleString('vi')}đ
      </p>
    </div>
  );
}
