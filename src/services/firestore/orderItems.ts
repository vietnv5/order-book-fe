import {
  query,
  where,
  getDocs,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { db } from '@/config/firebase';
import { OrderItem } from '@/types';
import { getShopCollection, stripUndefined } from './base';

export const getOrderItems = async (shopId: string, orderId: string): Promise<OrderItem[]> => {
  const snap = await getDocs(
    query(
      getShopCollection(shopId, 'order_items'),
      where('orderId', '==', orderId),
    ),
  );
  return snap.docs.map((d) => ({ uuid: d.id, ...d.data() }) as OrderItem).filter((i) => !i.deleted);
};

export const saveOrderItems = async (
  shopId: string,
  orderId: string,
  items: Omit<OrderItem, 'uuid' | 'orderId'>[],
  existingItems: OrderItem[] = [],
): Promise<OrderItem[]> => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  // Soft-delete existing items
  for (const item of existingItems) {
    batch.update(doc(db, 'shops', shopId, 'order_items', item.uuid), {
      deleted: true, updatedAt: now,
    });
  }

  const saved: OrderItem[] = [];
  for (const item of items) {
    const uuid = uuidv7();
    const orderItem: OrderItem = { ...item, uuid, orderId, deleted: false };
    batch.set(doc(db, 'shops', shopId, 'order_items', uuid), stripUndefined(orderItem as unknown as Record<string, unknown>));
    saved.push(orderItem);
  }

  await batch.commit();
  return saved;
};
