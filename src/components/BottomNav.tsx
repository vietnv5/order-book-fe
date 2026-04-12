import { NavLink, useNavigate } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    label: 'Trang chủ',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/orders',
    label: 'Đơn hàng',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  null, // FAB placeholder
  {
    to: '/customers',
    label: 'Khách hàng',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/products',
    label: 'Sản phẩm',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 relative flex h-16 items-center justify-around bg-surface pb-safe">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />
      {tabs.map((tab, i) => {
        if (!tab) {
          // FAB center button
          return (
            <button
              key="fab"
              onClick={() => navigate('/orders/new')}
              className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', boxShadow: '0 4px 20px rgba(139,92,246,.50)' }}
              aria-label="Tạo đơn mới"
            >
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          );
        }
        return (
          <NavLink
            key={i}
            to={tab.to}
            end={tab.to === '/'}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : 'text-muted'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
