import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';
import { createShop, joinShop } from '@/services/firestore/shops';

type Mode = 'choose' | 'create' | 'join';

export default function SetupPage() {
  const { user } = useAuth();
  const { shop, allShops, refreshShop } = useShop();
  const alreadyOwnsShop = allShops.some((s) => s.ownerUid === user?.uid);
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [shopName, setShopName] = useState('');
  const [shopId, setShopId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;
  if (shop) return <Navigate to="/" replace />;

  const handleCreate = async () => {
    if (!shopName.trim()) return;
    setError(''); setLoading(true);
    try {
      await createShop(user.uid, shopName, user.displayName, user.email, user.photoURL);
      await refreshShop();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!shopId.trim()) return;
    setError(''); setLoading(true);
    try {
      await joinShop(user.uid, shopId.trim(), user.displayName, user.email, user.photoURL);
      await refreshShop();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Mã shop không hợp lệ');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app px-6 pt-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Thiết lập shop</h1>
        <p className="mt-1 text-sm text-muted">
          Xin chào, {user.displayName?.split(' ').pop()}! Tạo shop mới hoặc tham gia shop có sẵn.
        </p>
      </div>

      {mode === 'choose' && (
        <div className="flex flex-col gap-3">
          {!alreadyOwnsShop && (
          <button
            onClick={() => setMode('create')}
            className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-card transition-all active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-text">Tạo shop mới</p>
              <p className="text-sm text-muted">Bắt đầu quản lý đơn hàng của bạn</p>
            </div>
          </button>
          )}

          <button
            onClick={() => setMode('join')}
            className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-card transition-all active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-text">Tham gia shop</p>
              <p className="text-sm text-muted">Nhập mã shop để tham gia</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="flex flex-col gap-4">
          <button onClick={() => setMode('choose')} className="flex items-center gap-2 text-sm text-muted">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-semibold text-text">Tên shop của bạn</h2>
            <input
              autoFocus
              className="input-field"
              placeholder="VD: Shop Thời Trang ABC"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={loading || !shopName.trim()}
              className="btn-primary mt-4 w-full"
            >
              {loading ? 'Đang tạo...' : 'Tạo shop'}
            </button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="flex flex-col gap-4">
          <button onClick={() => setMode('choose')} className="flex items-center gap-2 text-sm text-muted">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <h2 className="mb-1 font-semibold text-text">Mã shop</h2>
            <p className="mb-4 text-sm text-muted">Nhờ chủ shop cung cấp mã cho bạn</p>
            <input
              autoFocus
              className="input-field font-mono text-sm"
              placeholder="Dán mã shop vào đây"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
            />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading || !shopId.trim()}
              className="btn-primary mt-4 w-full"
            >
              {loading ? 'Đang tham gia...' : 'Tham gia shop'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
