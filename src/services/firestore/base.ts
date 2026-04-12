import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const getShopCollection = (shopId: string, col: string): CollectionReference<DocumentData> =>
  collection(db, 'shops', shopId, col);

/** Strip `undefined` values so Firestore never receives unsupported field values */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripUndefined = (obj: Record<string, unknown>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
