import { Order } from './order';

export type OrderActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'payment_changed'
  | 'deleted';

export interface OrderActivity {
  uuid: string;
  orderId: string;
  action: OrderActivityAction;
  before?: Partial<Order>;
  after?: Partial<Order>;
  createdAt: string;
  createdBy?: string;
}

export const ORDER_ACTIVITY_LABELS: Record<OrderActivityAction, string> = {
  created: 'Tạo đơn hàng',
  updated: 'Cập nhật đơn hàng',
  status_changed: 'Thay đổi trạng thái',
  payment_changed: 'Thay đổi thanh toán',
  deleted: 'Xóa đơn hàng',
};
