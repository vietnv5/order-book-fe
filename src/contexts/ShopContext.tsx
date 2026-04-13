import React, { createContext, useContext, useEffect, useState } from 'react';
import { Shop } from '@/types';
import { getMyShops } from '@/services/firestore/shops';
import { useAuth } from './AuthContext';

interface ShopContextValue {
  shop: Shop | null;
  shopId: string | null;
  role: 'owner' | 'editor' | null;
  loading: boolean;
  allShops: Shop[];
  refreshShop: () => Promise<void>;
  switchShop: (s: Shop) => void;
}

const ShopContext = createContext<ShopContextValue>({
  shop: null,
  shopId: null,
  role: null,
  loading: true,
  allShops: [],
  refreshShop: async () => {},
  switchShop: () => {},
});

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [role, setRole] = useState<'owner' | 'editor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [allShops, setAllShops] = useState<Shop[]>([]);

  const loadShop = async () => {
    if (!user) { setShop(null); setAllShops([]); setLoading(false); return; }
    setLoading(true);
    try {
      const myShops = await getMyShops(user.uid);
      setAllShops(myShops);

      // Prefer own shop, fallback to first joined shop
      const ownShop = myShops.find((s) => s.ownerUid === user.uid) ?? null;
      if (ownShop) {
        setShop(ownShop);
        setRole('owner');
      } else if (myShops.length > 0) {
        setShop(myShops[0]);
        setRole('editor');
      } else {
        setShop(null);
        setRole(null);
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
      value={{ shop, shopId: shop?.shopId ?? null, role, loading, allShops, refreshShop: loadShop, switchShop }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
