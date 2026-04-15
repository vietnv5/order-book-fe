import { useNavigate } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import OrderForm from '@/components/order/OrderForm';
import { useShop } from '@/contexts/ShopContext';
import { createOrder } from '@/services/firestore/orders';
import { saveOrderItems } from '@/services/firestore/orderItems';
import { findOrCreateCustomer } from '@/services/firestore/customers';
import { Order } from '@/types';
import { OrderItemDraft } from '@/components/order/OrderItemRow';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const { shopId } = useShop();

  const handleSubmit = async (orderData: Partial<Order>, items: OrderItemDraft[]) => {
    if (!shopId) return;

    // Auto-create/find customer if name is provided but no customerId
    let customerId = orderData.customerId;
    if (!customerId && orderData.customerName) {
      const customer = await findOrCreateCustomer(shopId, orderData.customerName, orderData.customerPhone);
      customerId = customer.uuid;
    }

    const order = await createOrder(shopId, { ...orderData, customerId } as Omit<Order, 'uuid' | 'createdAt'>);
    if (items.length > 0) {
      await saveOrderItems(shopId, order.uuid, items);
    }
    navigate(`/orders/${order.uuid}`, { replace: true });
  };

  return (
    <DefaultLayout>
      <AppHeader title="Tạo đơn hàng" showBack />
      <div className="px-4 py-4">
        <OrderForm shopId={shopId ?? ''} onSubmit={handleSubmit} submitLabel="Tạo đơn hàng" />
      </div>
    </DefaultLayout>
  );
}
