import {
  setDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { auth, db } from '@/config/firebase';
import { OrderActivity } from '@/types/orderActivity';
import { getShopCollection, stripUndefined, nowGMT7 } from './base';

/**
 * Write an activity log entry for an order.
 * Matches the Flutter ActivityLogModel schema.
 * Call with .catch(console.warn) to avoid blocking the main operation.
 */
export const logOrderActivity = async (
  shopId: string,
  activity: Omit<OrderActivity, 'uuid' | 'createdAt' | 'updatedAt' | 'actor'>,
): Promise<void> => {
  const uuid = uuidv7();
  const now = nowGMT7();
  const entry: OrderActivity = {
    ...activity,
    uuid,
    targetId: activity.targetId ?? null,
    createdAt: now,
    updatedAt: now,
    actor: auth.currentUser?.uid,
  };
  const payload = stripUndefined(entry as unknown as Record<string, unknown>);
  await setDoc(doc(db, 'shops', shopId, 'activity_logs', uuid), payload);
};

/**
 * Fetch activity history for a single order, newest first.
 */
export const getOrderActivities = async (
  shopId: string,
  orderId: string,
): Promise<OrderActivity[]> => {
  const col = getShopCollection(shopId, 'activity_logs');
  try {
    const snap = await getDocs(
      query(
        col,
        where('targetUuid', '==', orderId),
        orderBy('createdAt', 'desc'),
      ),
    );
    return snap.docs.map((d) => ({ uuid: d.id, ...d.data() }) as OrderActivity);
  } catch (error) {
    // Missing composite index can break where+orderBy; fallback to where-only + client sort.
    console.warn('[activity] read activity_logs with orderBy failed, fallback to client sort', error);
    const snap = await getDocs(query(col, where('targetUuid', '==', orderId)));
    return snap.docs
      .map((d) => ({ uuid: d.id, ...d.data() }) as OrderActivity)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }
};
