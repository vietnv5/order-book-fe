import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import BottomSheet from '@/components/BottomSheet';
import OrderForm from '@/components/order/OrderForm';
import { useShop } from '@/contexts/ShopContext';
import { getOrder, updateOrder, deleteOrder } from '@/services/firestore/orders';
import { getOrderItems, saveOrderItems } from '@/services/firestore/orderItems';
import { findOrCreateCustomer } from '@/services/firestore/customers';
import { getOrderActivities } from '@/services/firestore/orderActivities';
import { Order, OrderItem, DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';
import { OrderActivity, ORDER_ACTIVITY_LABELS } from '@/types/orderActivity';
import { OrderItemDraft } from '@/components/order/OrderItemRow';

export default function OrderDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { shopId } = useShop();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activities, setActivities] = useState<OrderActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const loadOrder = async () => {
    if (!shopId || !uuid) return;
    const [o, oi] = await Promise.all([getOrder(shopId, uuid), getOrderItems(shopId, uuid)]);
    setOrder(o);
    setItems(oi);
    setLoading(false);
  };

  useEffect(() => { loadOrder(); }, [shopId, uuid]);

  const openHistory = async () => {
    setHistoryOpen(true);
    if (!shopId || !uuid) return;
    setActivitiesLoading(true);
    try {
      const data = await getOrderActivities(shopId, uuid);
      setActivities(data);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleStatusChange = async (status: DeliveryStatus) => {
    if (!shopId || !uuid) return;
    setStatusLoading(true);
    await updateOrder(shopId, uuid, { deliveryStatus: status });
    setOrder((o) => o ? { ...o, deliveryStatus: status } : o);
    setStatusLoading(false);
  };

  const handleTogglePaid = async () => {
    if (!shopId || !uuid || !order) return;
    await updateOrder(shopId, uuid, { paid: !order.paid });
    setOrder((o) => o ? { ...o, paid: !o.paid } : o);
  };

  const handleDelete = async () => {
    if (!shopId || !uuid) return;
    await deleteOrder(shopId, uuid);
    navigate('/orders', { replace: true });
  };

  const handleEdit = async (orderData: Partial<Order>, draftItems: OrderItemDraft[]) => {
    if (!shopId || !uuid) return;

    // Auto-create/find customer if name is provided but no customerId
    let customerId = orderData.customerId;
    if (!customerId && orderData.customerName) {
      const customer = await findOrCreateCustomer(shopId, orderData.customerName, orderData.customerPhone);
      customerId = customer.uuid;
    }

    await updateOrder(shopId, uuid, { ...orderData, customerId });
    await saveOrderItems(shopId, uuid, draftItems, items);
    await loadOrder();
    setEditOpen(false);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <AppHeader title="Đơn hàng" showBack />
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      </DefaultLayout>
    );
  }

  if (!order) {
    return (
      <DefaultLayout>
        <AppHeader title="Không tìm thấy" showBack />
        <p className="px-4 pt-8 text-center text-muted">Đơn hàng không tồn tại</p>
      </DefaultLayout>
    );
  }

  const statuses: DeliveryStatus[] = ['pending', 'assigned', 'shipping', 'completed'];

  return (
    <DefaultLayout>
      <AppHeader
        title="Chi tiết đơn"
        showBack
        rightAction={
          <div className="flex gap-1">
            <button
              onClick={openHistory}
              aria-label="Xem lịch sử"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-muted"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button onClick={() => setEditOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => setDeleteOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <svg className="h-4 w-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Customer info */}
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-text">{order.customerName}</p>
              {order.customerPhone && (
                <a href={`tel:${order.customerPhone}`} className="mt-0.5 flex items-center gap-1 text-sm text-primary">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {order.customerPhone}
                </a>
              )}
              {order.customerAddress && (
                <p className="mt-1 text-xs text-muted">{order.customerAddress}</p>
              )}
            </div>
            <StatusBadge status={order.deliveryStatus} />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted">
              {order.statAt || order.createdAt
                ? format(new Date(order.statAt ?? order.createdAt), 'dd/MM/yyyy', { locale: vi })
                : ''}
            </p>
            <button
              onClick={handleTogglePaid}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                order.paid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-muted'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${order.paid ? 'bg-success' : 'bg-gray-400'}`} />
              {order.paid ? 'Đã thanh toán' : 'Chưa TT'}
            </button>
          </div>
        </div>

        {/* Status stepper */}
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <p className="mb-3 text-sm font-medium text-text">Cập nhật trạng thái</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statuses.map((s) => (
              <button
                key={s}
                disabled={statusLoading}
                onClick={() => handleStatusChange(s)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  order.deliveryStatus === s ? 'bg-primary text-white' : 'bg-gray-100 text-muted'
                }`}
              >
                {DELIVERY_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Order items */}
        {items.length > 0 && (
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="mb-3 text-sm font-medium text-text">Sản phẩm</p>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.uuid} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{item.productName ?? 'Sản phẩm'}</p>
                    <p className="text-xs text-muted">
                      {item.quantity} {item.unit ?? ''} × {item.sellPrice?.toLocaleString('vi') ?? 0}đ
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text">
                    {((item.quantity ?? 0) * (item.sellPrice ?? 0)).toLocaleString('vi')}đ
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between py-1">
            <p className="text-sm text-muted">Tổng tiền hàng</p>
            <p className="text-sm font-medium text-text">{(order.totalAmount ?? 0).toLocaleString('vi')}đ</p>
          </div>
          {order.deliveryFee != null && order.deliveryFee > 0 && (
            <div className="flex items-center justify-between py-1">
              <p className="text-sm text-muted">Phí giao hàng</p>
              <p className="text-sm text-text">{order.deliveryFee.toLocaleString('vi')}đ</p>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
            <p className="text-sm font-semibold text-text">Tổng cộng</p>
            <p className="text-base font-bold text-primary">
              {((order.totalAmount ?? 0) + (order.deliveryFee ?? 0)).toLocaleString('vi')}đ
            </p>
          </div>
        </div>

        {order.description && (
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="mb-1 text-xs text-muted">Ghi chú</p>
            <p className="text-sm text-text">{order.description}</p>
          </div>
        )}
      </div>

      {/* Edit sheet */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Sửa đơn hàng" fullHeight>
        <OrderForm
          initial={order}
          initialItems={items.map((i) => ({
            productId: i.productId,
            productName: i.productName ?? '',
            quantity: i.quantity,
            unit: i.unit,
            sellPrice: i.sellPrice ?? 0,
          }))}
          onSubmit={handleEdit}
          submitLabel="Lưu thay đổi"
        />
      </BottomSheet>

      {/* Activity history sheet */}
      <BottomSheet open={historyOpen} onClose={() => setHistoryOpen(false)} title="Lịch sử đơn hàng">
        {activitiesLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Chưa có lịch sử hoạt động</p>
        ) : (
          <div className="flex flex-col gap-0 pb-4">
            {activities.map((activity, idx) => (
              <div key={activity.uuid} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                    activity.action === 'created' ? 'bg-emerald-500'
                    : activity.action === 'deleted' ? 'bg-danger'
                    : activity.action === 'status_changed' ? 'bg-primary'
                    : activity.action === 'payment_changed' ? 'bg-amber-500'
                    : 'bg-slate-400'
                  }`} />
                  {idx < activities.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="pb-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-text">{ORDER_ACTIVITY_LABELS[activity.action]}</p>
                  {activity.action === 'status_changed' && activity.after?.deliveryStatus && (
                    <p className="text-xs text-muted">
                      {DELIVERY_STATUS_LABELS[activity.after.deliveryStatus]}
                    </p>
                  )}
                  {activity.action === 'payment_changed' && (
                    <p className="text-xs text-muted">
                      {activity.after?.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted">
                    {format(new Date(activity.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa đơn hàng?"
        message={`Đơn hàng của ${order.customerName} sẽ bị xóa.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </DefaultLayout>
  );
}
