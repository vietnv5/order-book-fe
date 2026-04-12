import { useEffect, useState } from 'react';
import { Order, DeliveryStatus } from '@/types';
import { subscribeOrders } from '@/services/firestore/orders';
import { useShop } from '@/contexts/ShopContext';

export const useOrders = (status: DeliveryStatus | 'all' = 'all') => {
  const { shopId } = useShop();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeOrders(shopId, (data) => {
      setAllOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [shopId]);

  const orders = status === 'all' ? allOrders : allOrders.filter((o) => o.deliveryStatus === status);
  return { orders, loading };
};
