export type OrderActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'payment_changed'
  | 'deleted'
  | 'items_changed';

export interface SimpleItem {
  productName: string;
  quantity: number;
  unit?: string;
  sellPrice: number;
}

/** Matches the Flutter ActivityLogModel schema */
export interface OrderActivity {
  uuid: string;
  module: string;         // 'orders'
  action: OrderActivityAction;
  targetType: string;     // 'order' | 'order_items'
  targetUuid: string;     // orderId
  title: string;          // human-readable label
  description?: string;   // human-readable detail (e.g. "Chờ → Đã giao")
  data?: Record<string, unknown>; // before/after/items payload
  actor?: string;         // auth.currentUser?.uid
  createdAt: string;
  updatedAt: string;
}

export const ORDER_ACTIVITY_LABELS: Record<OrderActivityAction, string> = {
  created: 'Tạo đơn hàng',
  updated: 'Cập nhật đơn hàng',
  status_changed: 'Thay đổi trạng thái',
  payment_changed: 'Thay đổi thanh toán',
  deleted: 'Xóa đơn hàng',
  items_changed: 'Cập nhật sản phẩm',
};
