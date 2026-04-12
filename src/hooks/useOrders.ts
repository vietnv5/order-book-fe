import { useEffect, useState } from 'react';
import { Order, DeliveryStatus } from '@/types';
import { subscribeOrders } from '@/services/firestore/orders';
import { useShop } from '@/contexts/ShopContext';

export const useOrders = (status: DeliveryStatus | 'all' = 'all') => {
  const { shopId } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeOrders(shopId, status, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [shopId, status]);

  return { orders, loading };
};
