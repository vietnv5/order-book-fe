export type DeliveryStatus = 'pending' | 'assigned' | 'shipping' | 'completed';
export type OrderSource = 'manual' | 'facebook' | 'messenger';

export interface Order {
  uuid: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerId?: string;
  statAt?: string;
  createdAt: string;
  updatedAt?: string;
  deliveryStatus: DeliveryStatus;
  totalAmount?: number;
  profit?: number;
  paid: boolean;
  shipperId?: string;
  shipperName?: string;
  deliveryFee?: number;
  description?: string;
  source: OrderSource;
  sourceCommentId?: string;
  sourceRawText?: string;
  commentAt?: string;
  deleted?: boolean;
}

export interface OrderItem {
  uuid: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unit?: string;
  sellPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Chờ xử lý',
  assigned: 'Đã giao tài xế',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: 'warning',
  assigned: 'secondary',
  shipping: 'primary',
  completed: 'success',
};
