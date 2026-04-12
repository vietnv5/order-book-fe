import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const getShopCollection = (shopId: string, col: string): CollectionReference<DocumentData> =>
  collection(db, 'shops', shopId, col);
