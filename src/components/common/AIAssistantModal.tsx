import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User as UserIcon, Loader2, Lightbulb, Compass, ShieldCheck } from 'lucide-react';
import { NusaLifeAppState } from '../../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: NusaLifeAppState;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  appState,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Halo ${appState.profile.name}! 👋 Saya **NusaLife AI Assistant**.\n\nSaya bisa membantu Anda merekap pengeluaran keuangan, merencanakan ide perjalanan, memecah tugas kerja harian, atau mengecek keamanan password. Apa yang ingin Anda diskusikan hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '📊 Analisis Keuanganku', icon: Lightbulb, query: 'Berikan evaluasi singkat mengenai kondisi keuangan saya bulan ini dan saran alokasi tabungan.' },
    { label: '🛵 Ide Rute Perjalanan', icon: Compass, query: 'Buatkan rencana perjalanan santai 2 hari akhir pekan ke daerah wisata pegunungan dengan budget 1 juta.' },
    { label: '🛡️ Audit Keamanan Password', icon: ShieldCheck, query: 'Bagaimana tips menjaga keamanan akun digital dan perbankan online saya?' },
  ];

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Gather relevant context for the AI
      const incomeTotal = appState.transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenseTotal = appState.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const pendingTodos = appState.todos.filter((t) => !t.isCompleted).map((t) => t.title);

      const context = {
        userName: appState.profile.name,
        totalIncome: incomeTotal,
        totalExpense: expenseTotal,
        balance: incomeTotal - expenseTotal,
        pendingTasksCount: pendingTodos.length,
        samplePendingTasks: pendingTodos.slice(0, 3),
        totalTrips: appState.trips.length,
        totalPasswords: appState.passwords.length,
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, context }),
      });

      const data = await res.json();
      const aiReply = data.response || 'Maaf, terjadi kendala saat merespons. Silakan coba lagi.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Gagal terhubung ke server AI. Mohon periksa koneksi internet Anda.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-md h-[88vh] sm:h-[650px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                NusaLife AI Assistant
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-500/30">
                  Gemini 3.7
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Asisten Cerdas Hidup Digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-xs whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center text-slate-400 text-xs py-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>NusaLife AI sedang berpikir...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 text-[11px] whitespace-nowrap border border-slate-700 transition"
              >
                <Icon className="w-3 h-3 text-emerald-400" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pertanyaan atau minta saran..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
