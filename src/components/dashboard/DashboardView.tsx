import React from 'react';
import { 
  Wallet, 
  KeyRound, 
  CheckSquare, 
  Compass, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';
import { NusaLifeAppState, TabType } from '../../types';
import { formatRupiah, getGreetingIndo } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  state: NusaLifeAppState;
  onSelectTab: (tab: TabType) => void;
  onOpenAI: () => void;
  onUpdateHabit: (habitId: string, delta: number) => void;
  onQuickAdd: (type: 'transaction' | 'todo' | 'password' | 'trip') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onSelectTab,
  onOpenAI,
  onUpdateHabit,
  onQuickAdd,
}) => {
  const { profile, transactions, todos, passwords, trips, habits } = state;
  const greeting = getGreetingIndo();

  // Financial Calculations
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  // Task Calculations
  const completedTodos = todos.filter((t) => t.isCompleted).length;
  const totalTodos = todos.length;
  const taskProgress = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  const nextUrgentTodo = todos.find((t) => !t.isCompleted && t.priority === 'Tinggi') || todos.find((t) => !t.isCompleted);

  // Password Security Score Calculation
  const totalPwds = passwords.length;
  const strongPwds = passwords.filter((p) => p.password.length >= 10 && /[A-Z]/.test(p.password) && /[0-9]/.test(p.password)).length;
  const securityScore = totalPwds > 0 ? Math.round((strongPwds / totalPwds) * 100) : 85;

  // Travel Stats
  const totalDistance = trips.reduce((sum, tr) => sum + tr.distanceKm, 0);
  const lastTrip = trips[0];

  const handleHabitToggle = (habitId: string, current: number, target: number) => {
    const isNowDone = current + 1 >= target;
    onUpdateHabit(habitId, 1);
    if (isNowDone) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  return (
    <div className="space-y-4 pb-24 text-slate-100 animate-in fade-in duration-300">
      
      {/* 1. Hero Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/70 p-4 border border-emerald-900/40 shadow-xl">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span>{greeting.icon}</span>
              <span>{greeting.greeting}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
              {profile.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-[240px] leading-relaxed">
              {greeting.sub}
            </p>
          </div>
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tanya AI</span>
          </button>
        </div>

        {/* Quick Summary Pill Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60 relative z-10 text-center">
          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">Tugas Selesai</span>
            <span className="text-sm font-bold text-emerald-400">{completedTodos}/{totalTodos} ({taskProgress}%)</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">Password Cloud</span>
            <span className="text-sm font-bold text-teal-300">{totalPwds} Akun</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">Jelajah Travel</span>
            <span className="text-sm font-bold text-amber-300">{totalDistance} km</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Shortcuts */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onQuickAdd('transaction')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition active:scale-95 shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-300 text-center leading-tight">Catat Uang</span>
          </button>

          <button
            onClick={() => onQuickAdd('todo')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition active:scale-95 shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-300 text-center leading-tight">Tugas Baru</span>
          </button>

          <button
            onClick={() => onQuickAdd('password')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition active:scale-95 shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-300 text-center leading-tight">Simpan Sandi</span>
          </button>

          <button
            onClick={() => onQuickAdd('trip')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition active:scale-95 shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-300 text-center leading-tight">Log Trip</span>
          </button>
        </div>
      </div>

      {/* 3. Main Feature Pillars (Interactive Cards) */}

      {/* Pillar A: Alur Uang-Ku */}
      <div 
        onClick={() => onSelectTab('finance')}
        className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alur Uang-Ku</h4>
              <p className="text-base font-extrabold text-white">{formatRupiah(balance)}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Masuk</span>
              <span className="font-semibold text-emerald-400">{formatRupiah(income)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-rose-950/60 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Keluar</span>
              <span className="font-semibold text-rose-400">{formatRupiah(expense)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pillar B: Notes & To-Do List */}
      <div 
        onClick={() => onSelectTab('notes')}
        className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 transition-all shadow-md group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catatan & To-Do</h4>
              <p className="text-sm font-bold text-white">
                {totalTodos - completedTodos} tugas aktif tersisa
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Progres Harian</span>
            <span>{completedTodos} dari {totalTodos} selesai</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        {nextUrgentTodo && (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="truncate text-slate-300">{nextUrgentTodo.title}</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded ml-2">
              {nextUrgentTodo.priority}
            </span>
          </div>
        )}
      </div>

      {/* Pillar C: Password Cloud & Travel Snapshot (2 Columns) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Password Cloud Mini Card */}
        <div 
          onClick={() => onSelectTab('passwords')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-3.5 transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
              {securityScore}% Aman
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-200">Password Cloud</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">{totalPwds} Kredensial tersimpan</p>
        </div>

        {/* Linimasa Travel Mini Card */}
        <div 
          onClick={() => onSelectTab('travel')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-base">{lastTrip?.coverEmoji || '🛵'}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-200">Linimasa Travel</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{lastTrip?.destination || 'Belum ada log'}</p>
        </div>

      </div>

      {/* 4. Daily Habits & Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Target Kebiasaan Harian
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            {habits.filter((h) => h.current >= h.target).length}/{habits.length} Tercapai
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {habits.map((habit) => {
            const isDone = habit.current >= habit.target;
            return (
              <div
                key={habit.id}
                onClick={() => handleHabitToggle(habit.id, habit.current, habit.target)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between select-none ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{habit.icon}</span>
                  <div>
                    <span className="text-xs font-medium block leading-tight">{habit.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {habit.current} / {habit.target} {habit.unit}
                    </span>
                  </div>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] text-slate-400">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
