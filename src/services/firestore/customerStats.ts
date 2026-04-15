import { getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Order } from '@/types';
import { CustomerStatistics } from '@/types/customer';
import { getShopCollection } from './base';

const STATS_ORDER_LIMIT = 1000;

export interface CustomerStatsResult {
  statsMap: Map<string, CustomerStatistics>;
  /** true when the shop has more orders than the fetch limit; statistics may be incomplete. */
  truncated: boolean;
}

/**
 * Compute per-customer statistics from the orders collection.
 * Returns a Map keyed by customerId and a truncated flag.
 * Fetches up to STATS_ORDER_LIMIT most-recent orders; shops exceeding this limit
 * will get incomplete statistics and truncated=true.
 */
export async function computeCustomerStats(shopId: string): Promise<CustomerStatsResult> {
  const snap = await getDocs(
    query(getShopCollection(shopId, 'orders'), orderBy('createdAt', 'desc'), limit(STATS_ORDER_LIMIT)),
  );

  const truncated = snap.size === STATS_ORDER_LIMIT;

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

  return { statsMap, truncated };
}
