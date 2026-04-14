import { useState } from "react";
import { useInstallPWA } from "@/hooks/useInstallPWA";

export function PWAInstallBanner() {
  const { canInstall, install } = useInstallPWA();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("pwa-install-dismissed") === "1"
  );

  if (!canInstall || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 safe-area-bottom">
      <div className="bg-surface shadow-card rounded-xl p-4 flex items-center gap-3 border border-white/10">
        <img src="/icon.png" alt="App icon" className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-text text-sm font-semibold leading-tight">Cài Sổ Đơn Hàng</p>
          <p className="text-muted text-xs mt-0.5">Truy cập nhanh từ màn hình chính</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-muted text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            Bỏ qua
          </button>
          <button
            onClick={install}
            className="btn-primary text-sm px-3 py-1.5"
          >
            Cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
