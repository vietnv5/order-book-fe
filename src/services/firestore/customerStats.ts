import { getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Order } from '@/types';
import { CustomerStatistics } from '@/types/customer';
import { getShopCollection } from './base';

/**
 * Compute per-customer statistics from the orders collection.
 * Returns a Map keyed by customerId.
 * Fetches up to 1000 most-recent orders (sufficient for small/medium shops).
 */
export async function computeCustomerStats(
  shopId: string,
): Promise<Map<string, CustomerStatistics>> {
  const snap = await getDocs(
    query(getShopCollection(shopId, 'orders'), orderBy('createdAt', 'desc'), limit(1000)),
  );

  const orders = snap.docs
    .map((d) => ({ uuid: d.id, ...d.data() }) as Order)
    .filter((o) => !o.deleted && o.customerId);

  const statsMap = new Map<string, CustomerStatistics>();

  for (const order of orders) {
    const cid = order.customerId!;
    if (!statsMap.has(cid)) {
      statsMap.set(cid, {
        customerId: cid,
        totalOrders: 0,
        unpaidOrders: 0,
        totalAmount: 0,
        totalDebt: 0,
      });
    }
    const s = statsMap.get(cid)!;
    s.totalOrders += 1;
    s.totalAmount += order.totalAmount ?? 0;
    if (!order.paid) {
      s.unpaidOrders += 1;
      s.totalDebt += order.totalAmount ?? 0;
    }
  }

  return statsMap;
}
