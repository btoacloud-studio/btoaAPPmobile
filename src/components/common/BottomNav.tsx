import React from 'react';
import { Home, KeyRound, CheckSquare, Wallet, Compass, User } from 'lucide-react';
import { TabType } from '../../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingTasksCount?: number;
  vaultLocked?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingTasksCount = 0,
  vaultLocked = false,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Beranda', icon: Home, badge: undefined },
    { 
      id: 'passwords' as TabType, 
      label: 'Password', 
      icon: KeyRound, 
      badge: vaultLocked ? '🔒' : undefined 
    },
    { 
      id: 'notes' as TabType, 
      label: 'Notes & ToDo', 
      icon: CheckSquare, 
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : undefined 
    },
    { id: 'finance' as TabType, label: 'Uang-Ku', icon: Wallet, badge: undefined },
    { id: 'travel' as TabType, label: 'Travel', icon: Compass, badge: undefined },
    { id: 'profile' as TabType, label: 'Profil', icon: User, badge: undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Background Glow Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-4 h-4 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center border border-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* iOS Home Indicator Bar Simulation */}
      <div className="w-28 h-1 bg-slate-700/60 rounded-full mx-auto mt-1.5" />
    </nav>
  );
};
