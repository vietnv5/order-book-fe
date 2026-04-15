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
import { getShopCollection, stripUndefined } from './base';

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
  await setDoc(doc(db, 'shops', shopId, 'customers', uuid), stripUndefined(customer as unknown as Record<string, unknown>));
  return customer;
};

export const updateCustomer = async (shopId: string, uuid: string, data: Partial<Customer>): Promise<void> => {
  await updateDoc(
    doc(db, 'shops', shopId, 'customers', uuid),
    stripUndefined({ ...data, updatedAt: new Date().toISOString() } as Record<string, unknown>),
  );
};

export const deleteCustomer = async (shopId: string, uuid: string): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'customers', uuid), {
    deleted: true, updatedAt: new Date().toISOString(),
  });
};

/**
 * Find an existing customer by name (+ optional phone), or create a new one.
 * Name matching is case-insensitive to stay consistent with the duplicate check
 * in the customers UI. Matching priority: name + phone (if phone provided), else name only.
 */
export const findOrCreateCustomer = async (
  shopId: string,
  name: string,
  phone?: string,
): Promise<Customer> => {
  const trimmedName = name.trim();
  const trimmedPhone = phone?.trim();
  const nameLower = trimmedName.toLowerCase();

  // Fetch all customers and do a case-insensitive in-memory match to avoid
  // Firestore's case-sensitive equality operator producing false negatives.
  const allCustomers = await getCustomers(shopId);
  const candidates = allCustomers.filter((c) => c.name.toLowerCase() === nameLower);

  if (trimmedPhone) {
    const byPhone = candidates.find((c) => c.sdt === trimmedPhone);
    if (byPhone) return byPhone;
  } else if (candidates.length > 0) {
    return candidates[0];
  }

  // Not found — create new
  return createCustomer(shopId, {
    name: trimmedName,
    sdt: trimmedPhone || undefined,
    active: true,
  });
};
