import {
  query, orderBy, setDoc, updateDoc, doc, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { db } from '@/config/firebase';
import { Shipper } from '@/types';
import { getShopCollection } from './base';

export const subscribeShippers = (
  shopId: string,
  callback: (shippers: Shipper[]) => void,
): Unsubscribe => {
  const q = query(
    getShopCollection(shopId, 'shippers'),
    orderBy('name', 'asc'),
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ uuid: d.id, ...d.data() }) as Shipper).filter((s) => !s.deleted)),
  );
};

export const createShipper = async (shopId: string, data: Omit<Shipper, 'uuid' | 'createdAt'>): Promise<Shipper> => {
  const uuid = uuidv7();
  const now = new Date().toISOString();
  const shipper: Shipper = { ...data, uuid, createdAt: now, updatedAt: now, deleted: false };
  await setDoc(doc(db, 'shops', shopId, 'shippers', uuid), shipper);
  return shipper;
};

export const updateShipper = async (shopId: string, uuid: string, data: Partial<Shipper>): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'shippers', uuid), {
    ...data, updatedAt: new Date().toISOString(),
  });
};

export const deleteShipper = async (shopId: string, uuid: string): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'shippers', uuid), {
    deleted: true, updatedAt: new Date().toISOString(),
  });
};
