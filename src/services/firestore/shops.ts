import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Shop, ShopMember } from '@/types';

export const getShop = async (shopId: string): Promise<Shop | null> => {
  const snap = await getDoc(doc(db, 'shops', shopId));
  if (!snap.exists()) return null;
  return snap.data() as Shop;
};

export const createShop = async (
  userId: string,
  shopName: string,
  userDisplayName?: string | null,
  userEmail?: string | null,
  userPhotoUrl?: string | null,
): Promise<Shop> => {
  const now = new Date().toISOString();
  const shop: Shop = {
    shopId: userId,
    name: shopName.trim(),
    ownerUid: userId,
    createdAt: now,
  };
  await setDoc(doc(db, 'shops', userId), shop);

  const member: ShopMember = {
    userId,
    shopId: userId,
    role: 'owner',
    joinedAt: now,
    displayName: userDisplayName ?? undefined,
    email: userEmail ?? undefined,
    photoUrl: userPhotoUrl ?? undefined,
  };
  await setDoc(doc(db, 'shop_members', `${userId}_${userId}`), member);
  return shop;
};

export const joinShop = async (
  userId: string,
  shopId: string,
  userDisplayName?: string | null,
  userEmail?: string | null,
  userPhotoUrl?: string | null,
): Promise<Shop> => {
  const shop = await getShop(shopId);
  if (!shop) throw new Error('Không tìm thấy shop với mã: ' + shopId);

  const memberRef = doc(db, 'shop_members', `${shopId}_${userId}`);
  const existing = await getDoc(memberRef);
  if (!existing.exists()) {
    const member: ShopMember = {
      userId,
      shopId,
      role: 'editor',
      joinedAt: new Date().toISOString(),
      displayName: userDisplayName ?? undefined,
      email: userEmail ?? undefined,
      photoUrl: userPhotoUrl ?? undefined,
    };
    await setDoc(memberRef, member);
  }
  return shop;
};

export const getMyShops = async (userId: string): Promise<Shop[]> => {
  const q = query(
    collection(db, 'shop_members'),
    where('userId', '==', userId),
  );
  const snap = await getDocs(q);
  const shopIds = snap.docs.map((d) => (d.data() as ShopMember).shopId);
  const shops = await Promise.all(shopIds.map(getShop));
  return shops.filter(Boolean) as Shop[];
};

export const getShopMembers = async (shopId: string): Promise<ShopMember[]> => {
  const q = query(collection(db, 'shop_members'), where('shopId', '==', shopId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ShopMember);
};

export const removeMember = async (shopId: string, userId: string): Promise<void> => {
  await deleteDoc(doc(db, 'shop_members', `${shopId}_${userId}`));
};

export const leaveShop = async (shopId: string, userId: string): Promise<void> => {
  const snap = await getDoc(doc(db, 'shop_members', `${shopId}_${userId}`));
  if (snap.exists() && (snap.data() as ShopMember).role === 'owner') {
    throw new Error('Chủ shop không thể rời shop');
  }
  await deleteDoc(doc(db, 'shop_members', `${shopId}_${userId}`));
};
