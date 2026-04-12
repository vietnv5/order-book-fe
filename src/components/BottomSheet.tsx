import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}

export default function BottomSheet({ open, onClose, title, children, fullHeight = false }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`relative z-10 flex flex-col rounded-t-3xl bg-surface ${fullHeight ? 'max-h-[92vh]' : 'max-h-[85vh]'}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 pb-3">
            <h2 className="text-[17px] font-semibold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-muted"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
