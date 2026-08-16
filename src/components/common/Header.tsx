import React from 'react';
import { Sparkles, Bell, Wifi, Battery, Signal } from 'lucide-react';
import { TabType, UserProfile } from '../../types';

interface HeaderProps {
  currentTab: TabType;
  profile: UserProfile;
  onOpenAI: () => void;
  onSelectTab: (tab: TabType) => void;
}

const tabTitles: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: { title: 'NusaLife', subtitle: 'Pusat Hidup Digital' },
  passwords: { title: 'Password Cloud', subtitle: 'Brankas Kredensial Aman' },
  notes: { title: 'Catatan & To-Do', subtitle: 'Ide & Produktivitas Harian' },
  finance: { title: 'Alur Uang-Ku', subtitle: 'Pencatat Keuangan Personal' },
  travel: { title: 'Linimasa Travel', subtitle: 'Jejak & Petualangan' },
  profile: { title: 'Profil & Pengaturan', subtitle: 'Preferensi Akun' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  profile,
  onOpenAI,
  onSelectTab,
}) => {
  const info = tabTitles[currentTab];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800 px-4 pt-3 pb-3">
      {/* Top Simulated Status Bar for Native App Feel */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1 select-none">
        <span className="font-medium tracking-tight text-slate-300">{timeStr}</span>
        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div 
            id="header-user-avatar-btn"
            onClick={() => onSelectTab('profile')}
            className="relative cursor-pointer group"
            title="Buka Profil"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/80 group-hover:ring-emerald-400 transition"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
              {info.title}
              {currentTab === 'dashboard' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PWA
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400 leading-none">{info.subtitle}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-trigger-ai-assistant"
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 text-xs font-semibold shadow-sm transition active:scale-95"
            title="Tanya Asisten AI NusaLife"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI Asisten</span>
          </button>
        </div>
      </div>
    </header>
  );
};
