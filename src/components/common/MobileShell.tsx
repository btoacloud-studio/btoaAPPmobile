import React, { useState } from 'react';
import { Smartphone, Monitor, Download, Check, X } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const [isFrameMode, setIsFrameMode] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  const handleInstallPwa = () => {
    setPwaInstalled(true);
    setTimeout(() => setShowPwaBanner(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Preview Controls Bar (Subtle & Non-Intrusive) */}
      <aside aria-label="Pengaturan Tampilan" className="w-full max-w-md mx-auto px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold text-[11px]">NusaLife PWA Mobile</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            onClick={() => setIsFrameMode(false)}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] transition ${
              !isFrameMode ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Responsif Fluid"
          >
            <Monitor className="w-3 h-3" />
            <span>Fluid</span>
          </button>
          <button
            onClick={() => setIsFrameMode(true)}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] transition ${
              isFrameMode ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Simulasi Frame Smartphone"
          >
            <Smartphone className="w-3 h-3" />
            <span>Phone Frame</span>
          </button>
        </div>
      </aside>

      {/* PWA Install Promotion Banner */}
      {showPwaBanner && (
        <aside aria-label="Instalasi PWA" className="w-full max-w-md px-3 pb-2">
          <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center justify-between shadow-lg text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                NL
              </div>
              <div>
                <p className="font-bold text-slate-100 leading-tight">Instal NusaLife PWA</p>
                <p className="text-[10px] text-slate-400">Akses cepat offline & notifikasi</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstallPwa}
                disabled={pwaInstalled}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
              >
                {pwaInstalled ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                <span>{pwaInstalled ? 'Terpasang' : 'Pasang'}</span>
              </button>
              <button
                onClick={() => setShowPwaBanner(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isFrameMode
            ? 'max-w-[400px] my-2 bg-slate-950 rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative min-h-[780px]'
            : 'max-w-md mx-auto min-h-screen bg-slate-950'
        }`}
      >
        {/* Dynamic Island / Notch Simulation in Frame Mode */}
        {isFrameMode && (
          <div className="w-full flex justify-center pt-2 pb-1 bg-slate-900/90 select-none">
            <div className="w-24 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            </div>
          </div>
        )}

        <main className="px-3 pt-2">{children}</main>
      </div>

    </div>
  );
};
