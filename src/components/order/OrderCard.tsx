import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import StatusBadge from '@/components/StatusBadge';
import { Order, DeliveryStatus } from '@/types';

const statusStrip: Record<DeliveryStatus, string> = {
  pending:   'from-amber-400 to-orange-400',
  assigned:  'from-indigo-500 to-violet-500',
  shipping:  'from-blue-400 to-cyan-400',
  completed: 'from-emerald-400 to-teal-400',
};

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const navigate = useNavigate();

  return (
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
          <StatusBadge status={order.deliveryStatus} size="sm" />
          {order.paid && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Đã TT
            </span>
          )}
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
            ? format(new Date(order.statAt ?? order.createdAt), 'dd/MM', { locale: vi })
            : ''}
        </p>
        <svg className="ml-auto mt-1 h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
