export interface Shop {
  shopId: string;
  name: string;
  ownerUid: string;
  createdAt: string;
}

export interface ShopMember {
  userId: string;
  shopId: string;
  role: 'owner' | 'editor';
  joinedAt: string;
  displayName?: string;
  email?: string;
  photoUrl?: string;
}
