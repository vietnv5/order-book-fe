import { useEffect, useState } from 'react';
import { Customer } from '@/types';
import { subscribeCustomers } from '@/services/firestore/customers';
import { useShop } from '@/contexts/ShopContext';

export const useCustomers = () => {
  const { shopId } = useShop();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeCustomers(shopId, (data) => {
      setCustomers(data);
      setLoading(false);
    });
    return unsub;
  }, [shopId]);

  return { customers, loading };
};
