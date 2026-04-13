import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import AppHeader from '@/components/AppHeader';
import SkeletonList from '@/components/SkeletonList';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useShop } from '@/contexts/ShopContext';
import { getShopMembers, removeMember } from '@/services/firestore/shops';
import { ShopMember } from '@/types';

function getInitials(member: ShopMember): string {
  const name = member.displayName ?? member.email?.split('@')[0] ?? 'U';
  return name[0]?.toUpperCase() ?? 'U';
}

function getDisplayName(member: ShopMember): string {
  return member.displayName ?? member.email?.split('@')[0] ?? 'Người dùng';
}

export default function MembersPage() {
  const { shopId, role, loading: shopLoading } = useShop();
  const [members, setMembers] = useState<ShopMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removeTarget, setRemoveTarget] = useState<ShopMember | null>(null);
  const [removing, setRemoving] = useState(false);

  // Show skeleton while shop context is still resolving
  if (shopLoading) {
    return (
      <DefaultLayout>
        <AppHeader title="Thành viên" showBack />
        <div className="px-4 pt-4"><SkeletonList count={4} /></div>
      </DefaultLayout>
    );
  }

  // Owner-only guard
  if (role !== 'owner') return <Navigate to="/" replace />;

  const loadMembers = async () => {
    if (!shopId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getShopMembers(shopId);
      // Sort: owner first, then by joinedAt
      data.sort((a, b) => {
        if (a.role === 'owner') return -1;
        if (b.role === 'owner') return 1;
        return a.joinedAt.localeCompare(b.joinedAt);
      });
      setMembers(data);
    } catch {
      setError('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { loadMembers(); }, [shopId]);

  const handleRemove = async () => {
    if (!shopId || !removeTarget) return;
    setRemoving(true);
    try {
      await removeMember(shopId, removeTarget.userId);
      setRemoveTarget(null);
      const updated = await getShopMembers(shopId);
      updated.sort((a, b) => {
        if (a.role === 'owner') return -1;
        if (b.role === 'owner') return 1;
        return a.joinedAt.localeCompare(b.joinedAt);
      });
      setMembers(updated);
    } catch {
      setError('Không thể xóa thành viên');
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <DefaultLayout>
      <AppHeader title="Thành viên" showBack />

      <div className="px-4 pt-4 pb-4">
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger dark:bg-red-900/20">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonList count={4} />
        ) : members.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
            title="Chưa có thành viên nào"
            description="Chia sẻ mã shop của bạn để mời người khác tham gia"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card"
              >
                {/* Avatar */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-base font-semibold text-primary">{getInitials(member)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text truncate">{getDisplayName(member)}</p>
                  {member.email && (
                    <p className="text-xs text-muted truncate">{member.email}</p>
                  )}
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      member.role === 'owner'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                  >
                    {member.role === 'owner' ? 'Chủ shop' : 'Biên tập'}
                  </span>
                </div>

                {/* Delete button — hidden for owner */}
                {member.role !== 'owner' && (
                  <button
                    onClick={() => setRemoveTarget(member)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger transition-all active:scale-95 dark:bg-red-900/20"
                    aria-label="Xóa thành viên"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        title="Xóa thành viên?"
        message={`"${
          removeTarget ? getDisplayName(removeTarget) : 'Thành viên'
        }" sẽ bị xóa khỏi shop.`}
        confirmLabel={removing ? 'Đang xóa...' : 'Xóa'}
        danger
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </DefaultLayout>
  );
}
