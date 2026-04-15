import { useMemo } from 'react';
import { Order } from '@/types';

interface CustomerEntry {
  key: string;
  name: string;
  totalAmount: number;
  totalOrders: number;
}

interface Props {
  orders: Order[];
}

export default function TopCustomers({ orders }: Props) {
  const top = useMemo(() => {
    const map = new Map<string, CustomerEntry>();
    for (const o of orders) {
      const key = o.customerId ?? o.customerName;
      if (!map.has(key)) map.set(key, { key, name: o.customerName, totalAmount: 0, totalOrders: 0 });
      const e = map.get(key)!;
      e.totalAmount += o.totalAmount ?? 0;
      e.totalOrders += 1;
    }
    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
  }, [orders]);

  if (top.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Không có dữ liệu trong kỳ này</p>;
  }

  const rankClass = (i: number) =>
    i === 0 ? 'bg-amber-100 text-amber-700'
    : i === 1 ? 'bg-slate-100 text-slate-600'
    : i === 2 ? 'bg-orange-100 text-orange-700'
    : 'bg-gray-100 text-muted';

  return (
    <div className="flex flex-col gap-2 pb-4">
      {top.map((entry, i) => (
        <div key={entry.key} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankClass(i)}`}>
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{entry.name}</p>
            <p className="text-xs text-muted">{entry.totalOrders} đơn</p>
          </div>
          <p className="text-sm font-bold text-primary shrink-0">
            {entry.totalAmount.toLocaleString('vi')}đ
          </p>
        </div>
      ))}
    </div>
  );
}
