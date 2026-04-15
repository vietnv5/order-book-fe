import {
  setDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { db } from '@/config/firebase';
import { OrderActivity } from '@/types/orderActivity';
import { getShopCollection, stripUndefined } from './base';

/**
 * Write an activity log entry for an order.
 * Call with .catch(console.warn) to avoid blocking the main operation.
 */
export const logOrderActivity = async (
  shopId: string,
  activity: Omit<OrderActivity, 'uuid' | 'createdAt'>,
): Promise<void> => {
  const uuid = uuidv7();
  const now = new Date().toISOString();
  const entry: OrderActivity = { ...activity, uuid, createdAt: now };
  await setDoc(
    doc(db, 'shops', shopId, 'order_activities', uuid),
    stripUndefined(entry as unknown as Record<string, unknown>),
  );
};

/**
 * Fetch activity history for a single order, newest first.
 */
export const getOrderActivities = async (
  shopId: string,
  orderId: string,
): Promise<OrderActivity[]> => {
  const snap = await getDocs(
    query(
      getShopCollection(shopId, 'order_activities'),
      where('orderId', '==', orderId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snap.docs.map((d) => ({ uuid: d.id, ...d.data() }) as OrderActivity);
};
