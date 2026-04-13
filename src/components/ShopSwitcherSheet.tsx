import { useState } from 'react';
import BottomSheet from './BottomSheet';
import ConfirmDialog from './ConfirmDialog';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { joinShop, leaveShop } from '@/services/firestore/shops';
import { Shop } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShopSwitcherSheet({ open, onClose }: Props) {
  const { shop, allShops, switchShop, refreshShop } = useShop();
  const { user } = useAuth();

  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);

  const [leaveTarget, setLeaveTarget] = useState<Shop | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  const isOwner = shop?.ownerUid === user?.uid;

  const handleSwitch = (s: Shop) => {
    switchShop(s);
    onClose();
  };

  const handleCopyShopId = async () => {
    if (!shop) return;
    try {
      await navigator.clipboard.writeText(shop.shopId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for environments without clipboard API
    }
  };

  const handleJoin = async () => {
    if (!joinId.trim() || !user) return;
    setJoinError('');
    setJoining(true);
    try {
      await joinShop(user.uid, joinId.trim(), user.displayName, user.email, user.photoURL);
      await refreshShop();
      setJoinId('');
      setShowJoin(false);
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : 'Mã shop không hợp lệ');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!leaveTarget || !user) return;
    setLeaveError('');
    setLeaving(true);
    try {
      await leaveShop(leaveTarget.shopId, user.uid);
      await refreshShop();
      setLeaveTarget(null);
      onClose();
      // Nếu rời shop duy nhất → shop = null → ProtectedRoute tự redirect /setup
    } catch (err: unknown) {
      setLeaveError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLeaving(false);
    }
  };

  const handleClose = () => {
    setShowJoin(false);
    setJoinId('');
    setJoinError('');
    setLeaveError('');
    onClose();
  };

  return (
    <>
      <BottomSheet open={open} onClose={handleClose} title="Chọn shop">
        {/* Current shop info (for owners to share their ID) */}
        {isOwner && shop && (
          <div className="mb-4 rounded-2xl border border-border bg-app p-4">
            <p className="mb-1 text-xs font-medium text-muted">Mã shop của bạn</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 font-mono text-sm text-text truncate">{shop.shopId}</p>
              <button
                onClick={handleCopyShopId}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface shadow-card transition-all active:scale-95"
                aria-label="Sao chép mã shop"
              >
                {copied ? (
                  <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted">Chia sẻ mã này để mời người khác tham gia</p>
          </div>
        )}

        {/* Shop list */}
        {allShops.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wide px-0.5">Shop của bạn</p>
            <div className="flex flex-col gap-2">
              {allShops.map((s) => {
                const isActive = s.shopId === shop?.shopId;
                const isShopOwner = s.ownerUid === user?.uid;
                return (
                  <div
                    key={s.shopId}
                    className={`flex items-center gap-3 rounded-2xl p-4 transition-all ${
                      isActive
                        ? 'bg-primary/10 ring-[1.5px] ring-primary'
                        : 'bg-surface shadow-card'
                    }`}
                  >
                    {/* Clickable area: avatar + info */}
                    <button
                      onClick={() => handleSwitch(s)}
                      className="flex flex-1 min-w-0 items-center gap-3 text-left"
                    >
                      {/* Shop avatar */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold ${
                          isActive ? 'bg-primary text-white' : 'bg-app text-primary'
                        }`}
                      >
                        {s.name[0]?.toUpperCase() ?? 'S'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-text'}`}>{s.name}</p>
                        <span
                          className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isShopOwner
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {isShopOwner ? 'Chủ shop' : 'Biên tập'}
                        </span>
                      </div>
                    </button>

                    {/* Right side: active checkmark OR leave button */}
                    {isActive && !isShopOwner ? (
                      // Active non-owner shop: show leave button with danger styling
                      <button
                        onClick={() => setLeaveTarget(s)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger transition-all active:scale-95 dark:bg-red-900/20"
                        aria-label="Rời shop"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    ) : isActive ? (
                      // Active owner shop: just show checkmark
                      <svg className="h-5 w-5 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    ) : !isShopOwner ? (
                      // Inactive non-owner shop: show leave button (muted)
                      <button
                        onClick={() => setLeaveTarget(s)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-muted transition-all active:scale-95 dark:bg-slate-700"
                        aria-label="Rời shop"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {leaveError && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-danger dark:bg-red-900/20">{leaveError}</p>
        )}

        {/* Join new shop */}
        <div className="rounded-2xl bg-surface shadow-card overflow-hidden">
          <button
            onClick={() => setShowJoin((v) => !v)}
            className="flex w-full items-center gap-3 p-4 text-left transition-all active:bg-gray-50 dark:active:bg-slate-700/50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text">Tham gia shop khác</p>
              <p className="text-xs text-muted">Nhập mã shop để tham gia</p>
            </div>
            <svg
              className={`h-5 w-5 text-muted transition-transform duration-200 ${showJoin ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showJoin && (
            <div className="border-t border-border px-4 pb-4 pt-3">
              <input
                autoFocus
                className="input-field font-mono text-sm"
                placeholder="Dán mã shop vào đây"
                value={joinId}
                onChange={(e) => { setJoinId(e.target.value); setJoinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              {joinError && <p className="mt-2 text-sm text-danger">{joinError}</p>}
              <button
                onClick={handleJoin}
                disabled={joining || !joinId.trim()}
                className="btn-primary mt-3 w-full"
              >
                {joining ? 'Đang tham gia...' : 'Tham gia'}
              </button>
            </div>
          )}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!leaveTarget}
        title="Rời shop?"
        message={`Bạn sẽ rời "${leaveTarget?.name}". Có thể tham gia lại bằng mã shop.`}
        confirmLabel={leaving ? 'Đang rời...' : 'Rời shop'}
        danger
        onConfirm={handleLeave}
        onCancel={() => { setLeaveTarget(null); setLeaveError(''); }}
      />
    </>
  );
}
