import { ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Xác nhận',
  onConfirm, onCancel, danger = false,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <div className="mt-2 text-sm text-muted">{message}</div>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Hủy</button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 ${danger ? 'bg-danger' : 'bg-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
