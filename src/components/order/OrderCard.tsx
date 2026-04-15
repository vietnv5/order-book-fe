import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import StatusBadge from '@/components/StatusBadge';
import BottomSheet from '@/components/BottomSheet';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Order, DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';

const statusStrip: Record<DeliveryStatus, string> = {
  pending:   'from-amber-400 to-orange-400',
  assigned:  'from-indigo-500 to-violet-500',
  shipping:  'from-blue-400 to-cyan-400',
  completed: 'from-emerald-400 to-teal-400',
};

const ALL_STATUSES: DeliveryStatus[] = ['pending', 'assigned', 'shipping', 'completed'];

interface Props {
  order: Order;
  onUpdateStatus?: (uuid: string, status: DeliveryStatus) => Promise<void>;
  onUpdatePaid?: (uuid: string, paid: boolean) => Promise<void>;
}

export default function OrderCard({ order, onUpdateStatus, onUpdatePaid }: Props) {
  const navigate = useNavigate();
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<DeliveryStatus | null>(null);
  const [confirmPaidOpen, setConfirmPaidOpen] = useState(false);

  const handleStatusSelect = (status: DeliveryStatus) => {
    setStatusSheetOpen(false);
    // small delay so sheet closes before dialog opens
    setTimeout(() => setPendingStatus(status), 150);
  };

  const handleStatusConfirm = async () => {
    if (!pendingStatus || !onUpdateStatus) return;
    const s = pendingStatus;
    setPendingStatus(null);
    await onUpdateStatus(order.uuid, s);
  };

  const handlePaidConfirm = async () => {
    if (!onUpdatePaid) return;
    setConfirmPaidOpen(false);
    await onUpdatePaid(order.uuid, !order.paid);
  };

  return (
    <>
      <button
        onClick={() => navigate(`/orders/${order.uuid}`)}
        className="relative overflow-hidden flex w-full items-start justify-between rounded-2xl bg-surface p-4 pl-5 shadow-card text-left transition-all active:scale-[0.98]"
      >
        <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${statusStrip[order.deliveryStatus]}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-text truncate">{order.customerName}</p>
            {order.source !== 'manual' && (
              <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                {order.source === 'facebook' ? 'FB' : 'MSG'}
              </span>
            )}
          </div>
          {order.customerPhone && (
            <p className="mt-0.5 text-xs text-muted">{order.customerPhone}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {/* Delivery status — tappable */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (onUpdateStatus) setStatusSheetOpen(true); }}
              className={`touch-manipulation rounded-full ${onUpdateStatus ? 'active:opacity-70' : ''}`}
              aria-label={`Trạng thái: ${DELIVERY_STATUS_LABELS[order.deliveryStatus]}${onUpdateStatus ? '. Nhấn để thay đổi' : ''}`}
            >
              <StatusBadge status={order.deliveryStatus} size="sm" />
            </button>

            {/* Payment status — always visible, tappable */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (onUpdatePaid) setConfirmPaidOpen(true); }}
              className={`inline-flex touch-manipulation items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                onUpdatePaid ? 'active:opacity-70' : ''
              } ${order.paid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-muted dark:bg-slate-700'}`}
              aria-label={order.paid ? 'Đã thanh toán. Nhấn để thay đổi' : 'Chưa thanh toán. Nhấn để thay đổi'}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${order.paid ? 'bg-success' : 'bg-gray-400'}`} />
              {order.paid ? 'Đã TT' : 'Chưa TT'}
            </button>
          </div>
        </div>

        <div className="ml-3 shrink-0 text-right">
          {order.totalAmount != null && (
            <p className="font-semibold text-text text-sm">
              {order.totalAmount.toLocaleString('vi')}đ
            </p>
          )}
          <p className="mt-0.5 text-[11px] text-muted">
            {order.statAt || order.createdAt
              ? format(new Date(order.statAt ?? order.createdAt), 'HH:mm dd/MM', { locale: vi })
              : ''}
          </p>
          <svg className="ml-auto mt-1 h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Status picker sheet */}
      <BottomSheet
        open={statusSheetOpen}
        onClose={() => setStatusSheetOpen(false)}
        title="Đổi trạng thái giao hàng"
      >
        <div className="flex flex-col gap-2 pb-2">
          {ALL_STATUSES.map((status) => {
            const isCurrent = status === order.deliveryStatus;
            return (
              <button
                key={status}
                type="button"
                onClick={() => !isCurrent && handleStatusSelect(status)}
                disabled={isCurrent}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all ${
                  isCurrent
                    ? 'bg-app cursor-default'
                    : 'bg-surface shadow-card active:scale-[0.98] active:bg-gray-50 dark:active:bg-slate-700'
                }`}
              >
                <StatusBadge status={status} size="md" />
                {isCurrent ? (
                  <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Confirm delivery status change */}
      <ConfirmDialog
        open={!!pendingStatus}
        title="Xác nhận đổi trạng thái?"
        message={`Đơn của "${order.customerName}" sẽ được chuyển sang\n"${pendingStatus ? DELIVERY_STATUS_LABELS[pendingStatus] : ''}".`}
        confirmLabel="Xác nhận"
        onConfirm={handleStatusConfirm}
        onCancel={() => setPendingStatus(null)}
      />

      {/* Confirm payment status toggle */}
      <ConfirmDialog
        open={confirmPaidOpen}
        title="Xác nhận đổi thanh toán?"
        message={order.paid
          ? `Đổi đơn của "${order.customerName}" sang "Chưa thanh toán"?`
          : `Xác nhận "${order.customerName}" đã thanh toán?`}
        confirmLabel="Xác nhận"
        onConfirm={handlePaidConfirm}
        onCancel={() => setConfirmPaidOpen(false)}
      />
    </>
  );
}
