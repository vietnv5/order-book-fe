import { useState, useEffect, useMemo } from 'react';
import { getDocs, query, limit } from 'firebase/firestore';
import { OrderItem } from '@/types';
import { getShopCollection } from '@/services/firestore/base';

interface ProductEntry {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
}

interface Props {
  shopId: string;
  orderIds: Set<string>;
}

export default function TopProducts({ shopId, orderIds }: Props) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getDocs(query(getShopCollection(shopId, 'order_items'), limit(2000)))
      .then((snap) => {
        setItems(
          snap.docs
            .map((d) => ({ uuid: d.id, ...d.data() }) as OrderItem)
            .filter((i) => !i.deleted),
        );
      })
      .finally(() => setLoading(false));
  }, [shopId]);

  const top = useMemo(() => {
    const rangeItems = items.filter((i) => orderIds.has(i.orderId));
    const map = new Map<string, ProductEntry>();
    for (const item of rangeItems) {
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          productId: item.productId,
          productName: item.productName ?? item.productId,
          totalRevenue: 0,
          totalQuantity: 0,
        });
      }
      const e = map.get(item.productId)!;
      e.totalRevenue += (item.quantity ?? 0) * (item.sellPrice ?? 0);
      e.totalQuantity += item.quantity ?? 0;
    }
    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  }, [items, orderIds]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (top.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Không có dữ liệu sản phẩm trong kỳ này</p>;
  }

  const rankClass = (i: number) =>
    i === 0 ? 'bg-amber-100 text-amber-700'
    : i === 1 ? 'bg-slate-100 text-slate-600'
    : i === 2 ? 'bg-orange-100 text-orange-700'
    : 'bg-gray-100 text-muted';

  return (
    <div className="flex flex-col gap-2 pb-4">
      {top.map((entry, i) => (
        <div key={entry.productId} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankClass(i)}`}>
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{entry.productName}</p>
            <p className="text-xs text-muted">SL: {entry.totalQuantity}</p>
          </div>
          <p className="text-sm font-bold text-primary shrink-0">
            {entry.totalRevenue.toLocaleString('vi')}đ
          </p>
        </div>
      ))}
    </div>
  );
}
