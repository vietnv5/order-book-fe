export const ORDER_ACTIVITY_ACTIONS = {
  CREATE_ORDER: 'CREATE_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  CHANGE_ORDER_STATUS: 'CHANGE_ORDER_STATUS',
  CHANGE_PAYMENT_STATUS: 'CHANGE_PAYMENT_STATUS',
  DELETE_ORDER: 'DELETE_ORDER',
  UPDATE_ORDER_ITEM: 'UPDATE_ORDER_ITEM',
} as const;

export type CanonicalOrderActivityAction =
  (typeof ORDER_ACTIVITY_ACTIONS)[keyof typeof ORDER_ACTIVITY_ACTIONS];

export type LegacyOrderActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'payment_changed'
  | 'deleted'
  | 'items_changed';

export type OrderActivityAction = CanonicalOrderActivityAction | LegacyOrderActivityAction;

export interface SimpleItem {
  productName: string;
  quantity: number;
  unit?: string;
  sellPrice: number;
}

/** Matches the Flutter ActivityLogModel schema */
export interface OrderActivity {
  uuid: string;
  module: string;         // e.g. 'ORDER'
  action: OrderActivityAction;
  targetType: string;     // e.g. 'ORDER' | 'ORDER_ITEMS'
  targetId?: number | null;
  targetUuid: string;     // orderId
  title: string;          // human-readable label
  description?: string;   // human-readable detail (e.g. "Chờ → Đã giao")
  data?: Record<string, unknown>; // before/after/items payload
  actor?: string;         // auth.currentUser?.uid
  createdAt: string;
  updatedAt: string;
}

export const ORDER_ACTIVITY_LABELS: Record<OrderActivityAction, string> = {
  CREATE_ORDER: 'Tạo đơn hàng',
  UPDATE_ORDER: 'Cập nhật đơn hàng',
  CHANGE_ORDER_STATUS: 'Thay đổi trạng thái',
  CHANGE_PAYMENT_STATUS: 'Thay đổi thanh toán',
  DELETE_ORDER: 'Xóa đơn hàng',
  UPDATE_ORDER_ITEM: 'Cập nhật sản phẩm',
  created: 'Tạo đơn hàng',
  updated: 'Cập nhật đơn hàng',
  status_changed: 'Thay đổi trạng thái',
  payment_changed: 'Thay đổi thanh toán',
  deleted: 'Xóa đơn hàng',
  items_changed: 'Cập nhật sản phẩm',
};

export const LEGACY_TO_CANONICAL_ORDER_ACTIVITY_ACTION: Record<LegacyOrderActivityAction, CanonicalOrderActivityAction> = {
  created: ORDER_ACTIVITY_ACTIONS.CREATE_ORDER,
  updated: ORDER_ACTIVITY_ACTIONS.UPDATE_ORDER,
  status_changed: ORDER_ACTIVITY_ACTIONS.CHANGE_ORDER_STATUS,
  payment_changed: ORDER_ACTIVITY_ACTIONS.CHANGE_PAYMENT_STATUS,
  deleted: ORDER_ACTIVITY_ACTIONS.DELETE_ORDER,
  items_changed: ORDER_ACTIVITY_ACTIONS.UPDATE_ORDER_ITEM,
};

export const normalizeOrderActivityAction = (action: OrderActivityAction): CanonicalOrderActivityAction => {
  if (action in LEGACY_TO_CANONICAL_ORDER_ACTIVITY_ACTION) {
    return LEGACY_TO_CANONICAL_ORDER_ACTIVITY_ACTION[action as LegacyOrderActivityAction];
  }
  return action as CanonicalOrderActivityAction;
};
