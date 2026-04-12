import { DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types';

const colorMap: Record<DeliveryStatus, string> = {
  pending: 'bg-warning/15 text-yellow-700',
  assigned: 'bg-primary/10 text-indigo-700',
  shipping: 'bg-info/10 text-blue-700',
  completed: 'bg-success/10 text-emerald-700',
};

const dotMap: Record<DeliveryStatus, string> = {
  pending: 'bg-warning',
  assigned: 'bg-primary',
  shipping: 'bg-info',
  completed: 'bg-success',
};

interface Props {
  status: DeliveryStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colorMap[status]} ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotMap[status]}`} />
      {DELIVERY_STATUS_LABELS[status]}
    </span>
  );
}
