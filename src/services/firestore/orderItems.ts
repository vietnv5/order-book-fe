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
import { getShopCollection, stripUndefined, nowGMT7 } from './base';
import { logOrderActivity } from './orderActivities';
import { SimpleItem, ORDER_ACTIVITY_ACTIONS, ORDER_ACTIVITY_LABELS } from '@/types/orderActivity';

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
  const now = nowGMT7();

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

  const toSimple = (arr: Array<{ productName?: string; quantity: number; unit?: string; sellPrice?: number }>): SimpleItem[] =>
    arr.map((i) => ({ productName: i.productName ?? '', quantity: i.quantity, unit: i.unit, sellPrice: i.sellPrice ?? 0 }));

  const itemsBefore = toSimple(existingItems);
  const itemsAfter = toSimple(saved);
  const description = `${itemsBefore.length} → ${itemsAfter.length} sản phẩm`;

  logOrderActivity(shopId, {
    module: 'ORDER',
    action: ORDER_ACTIVITY_ACTIONS.UPDATE_ORDER_ITEM,
    targetType: 'ORDER_ITEMS',
    targetId: null,
    targetUuid: orderId,
    title: ORDER_ACTIVITY_LABELS[ORDER_ACTIVITY_ACTIONS.UPDATE_ORDER_ITEM],
    description,
    data: { itemsBefore, itemsAfter },
  }).catch(console.warn);

  return saved;
};
