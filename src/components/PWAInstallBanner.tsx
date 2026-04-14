import { useState } from "react";
import { useInstallPWA } from "@/hooks/useInstallPWA";

export function PWAInstallBanner() {
  const { canInstall, install, isIOS, isStandalone } = useInstallPWA();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("pwa-install-dismissed") === "1"
  );

  // Already installed as standalone app
  if (isStandalone || dismissed) return null;

  // iOS: no beforeinstallprompt — show manual instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-safe">
        <div className="bg-surface shadow-card rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <img src="/icon.png" alt="App icon" className="w-10 h-10 rounded-xl shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-semibold leading-tight">Cài Sổ Đơn Hàng lên iPhone</p>
              <p className="text-muted text-xs mt-1 leading-relaxed">
                Nhấn{" "}
                <span className="inline-flex items-center gap-0.5 text-primary font-medium">
                  {/* Safari Share icon */}
                  <svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Chia sẻ
                </span>
                {" "}rồi chọn{" "}
                <span className="text-primary font-medium">Thêm vào màn hình chính</span>
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem("pwa-install-dismissed", "1");
                setDismissed(true);
              }}
              className="text-muted p-1 -mt-1 -mr-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
              aria-label="Đóng"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android / Chrome: beforeinstallprompt available
  if (!canInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-safe">
      <div className="bg-surface shadow-card rounded-xl p-4 flex items-center gap-3 border border-white/10">
        <img src="/icon.png" alt="App icon" className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-text text-sm font-semibold leading-tight">Cài Sổ Đơn Hàng</p>
          <p className="text-muted text-xs mt-0.5">Truy cập nhanh từ màn hình chính</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sessionStorage.setItem("pwa-install-dismissed", "1");
              setDismissed(true);
            }}
            className="text-muted text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            Bỏ qua
          </button>
          <button onClick={install} className="btn-primary text-sm px-3 py-1.5">
            Cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
