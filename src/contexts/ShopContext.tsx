import React, { createContext, useContext, useEffect, useState } from 'react';
import { Shop } from '@/types';
import { getShop, getMyShops } from '@/services/firestore/shops';
import { useAuth } from './AuthContext';

interface ShopContextValue {
  shop: Shop | null;
  shopId: string | null;
  role: 'owner' | 'editor' | null;
  loading: boolean;
  refreshShop: () => Promise<void>;
  switchShop: (s: Shop) => void;
}

const ShopContext = createContext<ShopContextValue>({
  shop: null,
  shopId: null,
  role: null,
  loading: true,
  refreshShop: async () => {},
  switchShop: () => {},
});

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [role, setRole] = useState<'owner' | 'editor' | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShop = async () => {
    if (!user) { setShop(null); setLoading(false); return; }
    setLoading(true);
    try {
      // Try to load own shop first (user is owner)
      const ownShop = await getShop(user.uid);
      if (ownShop) {
        setShop(ownShop);
        setRole('owner');
        setLoading(false);
        return;
      }
      // Try to find a shop the user has joined
      const myShops = await getMyShops(user.uid);
      if (myShops.length > 0) {
        setShop(myShops[0]);
        setRole('editor');
      } else {
        setShop(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadShop(); }, [user]);

  const switchShop = (s: Shop) => {
    setShop(s);
    setRole(s.ownerUid === user?.uid ? 'owner' : 'editor');
  };

  return (
    <ShopContext.Provider
      value={{ shop, shopId: shop?.shopId ?? null, role, loading, refreshShop: loadShop, switchShop }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
