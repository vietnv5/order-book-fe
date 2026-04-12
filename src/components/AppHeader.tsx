import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function AppHeader({ title, showBack = false, rightAction }: Props) {
  const navigate = useNavigate();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 relative flex h-14 items-center bg-surface px-4">
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full transition-all active:bg-gray-100 dark:active:bg-slate-700"
        >
          <svg className="h-5 w-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className={`flex-1 text-[17px] font-semibold text-text ${showBack ? 'ml-1' : ''}`}>
        {title}
      </h1>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  );
}
