import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function AppHeader({ title, showBack = false, rightAction }: Props) {
  const navigate = useNavigate();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-border bg-surface px-4">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-all active:bg-gray-100"
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
