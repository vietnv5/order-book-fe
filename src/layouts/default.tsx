import BottomNav from '@/components/BottomNav';

interface Props {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-app">
      <main className="main-content">{children}</main>
      <BottomNav />
    </div>
  );
}
