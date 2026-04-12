import {
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { db } from '@/config/firebase';
import { Order, DeliveryStatus } from '@/types';
import { getShopCollection } from './base';

export const subscribeOrders = (
  shopId: string,
  status: DeliveryStatus | 'all',
  callback: (orders: Order[]) => void,
): Unsubscribe => {
  let q = query(
    getShopCollection(shopId, 'orders'),
    where('deleted', '!=', true),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  if (status !== 'all') {
    q = query(
      getShopCollection(shopId, 'orders'),
      where('deliveryStatus', '==', status),
      where('deleted', '!=', true),
      orderBy('createdAt', 'desc'),
      limit(100),
    );
  }
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ uuid: d.id, ...d.data() }) as Order)),
  );
};

export const getOrder = async (shopId: string, uuid: string): Promise<Order | null> => {
  const snap = await getDoc(doc(db, 'shops', shopId, 'orders', uuid));
  if (!snap.exists()) return null;
  return { uuid: snap.id, ...snap.data() } as Order;
};

export const createOrder = async (shopId: string, data: Omit<Order, 'uuid' | 'createdAt'>): Promise<Order> => {
  const uuid = uuidv7();
  const now = new Date().toISOString();
  const order: Order = { ...data, uuid, createdAt: now, updatedAt: now, deleted: false };
  await setDoc(doc(db, 'shops', shopId, 'orders', uuid), order);
  return order;
};

export const updateOrder = async (shopId: string, uuid: string, data: Partial<Order>): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'orders', uuid), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteOrder = async (shopId: string, uuid: string): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'orders', uuid), {
    deleted: true,
    updatedAt: new Date().toISOString(),
  });
};

export const getOrdersOnce = async (shopId: string): Promise<Order[]> => {
  const snap = await getDocs(
    query(getShopCollection(shopId, 'orders'), where('deleted', '!=', true), orderBy('createdAt', 'desc'), limit(10)),
  );
  return snap.docs.map((d) => ({ uuid: d.id, ...d.data() }) as Order);
};
