import { useEffect, useState } from 'react';
import { Shipper } from '@/types';
import { subscribeShippers } from '@/services/firestore/shippers';
import { useShop } from '@/contexts/ShopContext';

export const useShippers = () => {
  const { shopId } = useShop();
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeShippers(shopId, (data) => {
      setShippers(data);
      setLoading(false);
    });
    return unsub;
  }, [shopId]);

  return { shippers, loading };
};
