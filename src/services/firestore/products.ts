import {
  query, orderBy, getDocs, setDoc, updateDoc, doc, onSnapshot, Unsubscribe, where,
} from 'firebase/firestore';
import { uuidv7 } from 'uuidv7';
import { db } from '@/config/firebase';
import { Product } from '@/types';
import { getShopCollection, stripUndefined, nowGMT7 } from './base';

export const subscribeProducts = (
  shopId: string,
  callback: (products: Product[]) => void,
): Unsubscribe => {
  const q = query(
    getShopCollection(shopId, 'products'),
    orderBy('name', 'asc'),
  );
  return onSnapshot(q, (snap) =>
    callback(
      snap.docs
        .map((d) => ({ uuid: d.id, ...d.data() }) as Product)
        .filter((p) => !p.deleted),
    ),
  );
};

export const getProducts = async (shopId: string): Promise<Product[]> => {
  const snap = await getDocs(
    query(getShopCollection(shopId, 'products'), orderBy('name', 'asc')),
  );
  return snap.docs
    .map((d) => ({ uuid: d.id, ...d.data() }) as Product)
    .filter((p) => !p.deleted);
};

export const createProduct = async (shopId: string, data: Omit<Product, 'uuid' | 'createdAt'>): Promise<Product> => {
  const uuid = uuidv7();
  const now = nowGMT7();
  const product: Product = { ...data, uuid, createdAt: now, updatedAt: now, deleted: false };
  await setDoc(doc(db, 'shops', shopId, 'products', uuid), stripUndefined(product as unknown as Record<string, unknown>));
  return product;
};

export const updateProduct = async (shopId: string, uuid: string, data: Partial<Product>): Promise<void> => {
  await updateDoc(
    doc(db, 'shops', shopId, 'products', uuid),
    stripUndefined({ ...data, updatedAt: nowGMT7() } as Record<string, unknown>),
  );
};

export const deleteProduct = async (shopId: string, uuid: string): Promise<void> => {
  await updateDoc(doc(db, 'shops', shopId, 'products', uuid), {
    deleted: true, updatedAt: nowGMT7(),
  });
};

export const findOrCreateProduct = async (shopId: string, name: string): Promise<Product> => {
  const trimmedName = name.trim();
  const snap = await getDocs(
    query(getShopCollection(shopId, 'products'), where('name', '==', trimmedName)),
  );
  const existing = snap.docs
    .map((d) => ({ uuid: d.id, ...d.data() }) as Product)
    .filter((p) => !p.deleted);
  if (existing.length > 0) return existing[0];
  return createProduct(shopId, { name: trimmedName, active: true });
};
