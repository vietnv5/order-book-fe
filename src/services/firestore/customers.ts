import {
  query,
  orderBy,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { db } from '@/config/firebase';
import { Customer } from '@/types';
import { getShopCollection } from './base';

export const subscribeCustomers = (
  shopId: string,
  callback: (customers: Customer[]) => void,
): Unsubscribe => {
  const q = query(
    getShopCollection(shopId, 'customers'),
    orderBy('name', 'asc'),
  );
  return onSnapshot(q, (snap) =>
    callback(
      snap.docs
        .map((d) => ({ uuid: d.id, ...d.data() }) as Customer)
        .filter((c) => !c.deleted),
    ),
  );
};

export const getCustomers = async (shopId: string): Promise<Customer[]> => {
  const snap = await getDocs(
    query(getShopCollection(shopId, 'customers'), orderBy('name', 'asc')),
  );
  return snap.docs
    .map((d) => ({ uuid: d.id, ...d.data() }) as Customer)
    .filter((c) => !c.deleted);
};

export const createCustomer = async (shopId: string, data: Omit<Customer, 'uuid' | 'createdAt'>): Promise<Customer> => {
  const uuid = uuidv7();
  const now = new Date().toISOString();
  const customer: Customer = { ...data, uuid, createdAt: now, updatedAt: now, deleted: false };
  await setDoc(doc(db, 'shops', shopId, 'customers', uuid), customer);
  return customer;
};

export const updateCustomer = async (shopId: string, uuid: string, data: Partial<Customer>): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'customers', uuid), {
    ...data, updatedAt: new Date().toISOString(),
  });
};

export const deleteCustomer = async (shopId: string, uuid: string): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'customers', uuid), {
    deleted: true, updatedAt: new Date().toISOString(),
  });
};
