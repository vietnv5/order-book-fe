import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { subscribeProducts } from '@/services/firestore/products';
import { useShop } from '@/contexts/ShopContext';

export const useProducts = () => {
  const { shopId } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeProducts(shopId, (data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, [shopId]);

  return { products, loading };
};
