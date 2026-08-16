import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart, 
  Sparkles,
  CreditCard,
  Calendar,
  X
} from 'lucide-react';
import { FinanceTransaction, TransactionType, FinanceCategory, PaymentMethod } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface FinanceViewProps {
  transactions: FinanceTransaction[];
  onAddTransaction: (trx: Omit<FinanceTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAI: () => void;
}

const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Lainnya',
];

const INCOME_CATEGORIES: FinanceCategory[] = [
  'Gaji & Pendapatan',
  'Investasi',
  'Lainnya',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'BCA',
  'Mandiri',
  'GoPay',
  'OVO',
  'Dana',
  'ShopeePay',
  'Cash / Tunai',
  'Lainnya',
];

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onOpenAI,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [trxType, setTrxType] = useState<TransactionType>('expense');
  const [trxTitle, setTrxTitle] = useState('');
  const [trxAmount, setTrxAmount] = useState<number>(50000);
  const [trxCategory, setTrxCategory] = useState<FinanceCategory>('Makanan & Minuman');
  const [trxPaymentMethod, setTrxPaymentMethod] = useState<PaymentMethod>('GoPay');
  const [trxDate, setTrxDate] = useState(new Date().toISOString().slice(0, 10));
  const [trxNote, setTrxNote] = useState('');

  // Financial Calculations
  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 100) : 0;

  // Category Breakdown for Expenses
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const total = transactions
      .filter((t) => t.type === 'expense' && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    const percent = expenseTotal > 0 ? Math.round((total / expenseTotal) * 100) : 0;
    return { category: cat, total, percent };
  }).filter((item) => item.total > 0).sort((a, b) => b.total - a.total);

  const openAddModal = (type: TransactionType = 'expense') => {
    setTrxType(type);
    setTrxTitle('');
    setTrxAmount(type === 'expense' ? 50000 : 500000);
    setTrxCategory(type === 'expense' ? 'Makanan & Minuman' : 'Gaji & Pendapatan');
    setTrxPaymentMethod('GoPay');
    setTrxDate(new Date().toISOString().slice(0, 10));
    setTrxNote('');
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxTitle || trxAmount <= 0) return;

    onAddTransaction({
      title: trxTitle,
      amount: trxAmount,
      type: trxType,
      category: trxCategory,
      paymentMethod: trxPaymentMethod,
      date: trxDate,
      note: trxNote,
    });

    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.8 },
    });

    setIsAddModalOpen(false);
  };

  // Filtered List
  const filtered = transactions.filter((t) => {
    const matchType = filterType === 'all' || t.type === filterType;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  const quickAmountPresets = [10000, 25000, 50000, 100000, 500000, 1000000];

  return (
    <div className="space-y-4 pb-24 text-slate-100 animate-in fade-in duration-300">
      
      {/* 1. Main Wallet Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/90 via-slate-900 to-slate-950 p-4 border border-emerald-500/30 shadow-xl">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            <span>Total Saldo Alur Uang-Ku</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
            {savingsRate >= 20 ? '🔥 Rasio Tabungan Sehat' : '⚠️ Awasi Pengeluaran'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {formatRupiah(balance)}
        </h2>

        {/* Income / Expense Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-800/40 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Pemasukan</span>
              <span className="font-bold text-emerald-400">{formatRupiah(incomeTotal)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Pengeluaran</span>
              <span className="font-bold text-rose-400">{formatRupiah(expenseTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => openAddModal('expense')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow transition active:scale-95"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Catat Pengeluaran</span>
        </button>

        <button
          onClick={() => openAddModal('income')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow transition active:scale-95"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Tambah Pemasukan</span>
        </button>
      </div>

      {/* 3. Category Breakdown Bars */}
      {categoryTotals.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Distribusi Pengeluaran</span>
            </h3>
            <span className="text-[10px] text-slate-400">Total: {formatRupiah(expenseTotal)}</span>
          </div>

          <div className="space-y-2">
            {categoryTotals.slice(0, 4).map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{item.category}</span>
                  <span className="font-semibold text-slate-200">
                    {formatRupiah(item.total)} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Transactions List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Riwayat Transaksi
          </h3>
          {/* AI Financial advice */}
          <button
            onClick={onOpenAI}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Analisis AI</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, kategori, atau metode..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {/* Transaction Cards */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Belum ada transaksi</p>
              <p className="text-xs text-slate-500 mt-1">Catat transaksi pertama Anda dengan tombol di atas.</p>
            </div>
          ) : (
            filtered.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div
                  key={t.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isIncome
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{t.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                          {t.category}
                        </span>
                        <span>•</span>
                        <span>{t.paymentMethod}</span>
                        <span>•</span>
                        <span>{formatDateIndo(t.date)}</span>
                      </div>
                      {t.note && <p className="text-[10px] text-slate-500 italic mt-0.5">"{t.note}"</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-sm font-extrabold block ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Catat Transaksi Alur Uang-Ku</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTrxType('expense');
                  setTrxCategory('Makanan & Minuman');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  trxType === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrxType('income');
                  setTrxCategory('Gaji & Pendapatan');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  trxType === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Pemasukan</span>
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              {/* Amount Input */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nominal (Rupiah) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min={100}
                    value={trxAmount || ''}
                    onChange={(e) => setTrxAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-extrabold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5">
                  {quickAmountPresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTrxAmount(val)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 whitespace-nowrap"
                    >
                      +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Deskripsi / Nama Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Makan Siang Nasi Padang, Belanja Mingguan..."
                  value={trxTitle}
                  onChange={(e) => setTrxTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                  <select
                    value={trxCategory}
                    onChange={(e) => setTrxCategory(e.target.value as FinanceCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {(trxType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Metode Bayar</label>
                  <select
                    value={trxPaymentMethod}
                    onChange={(e) => setTrxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Note */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={trxDate}
                    onChange={(e) => setTrxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Catatan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Struk, nomor invoice..."
                    value={trxNote}
                    onChange={(e) => setTrxNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`w-1/2 py-2.5 rounded-xl text-white text-xs font-bold shadow ${
                    trxType === 'expense' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
