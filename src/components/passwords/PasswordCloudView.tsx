import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  Unlock, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Star, 
  ExternalLink,
  Fingerprint,
  Sliders,
  X
} from 'lucide-react';
import { PasswordItem, PasswordCategory } from '../../types';
import { evaluatePasswordStrength, generateStrongPassword, PasswordGeneratorOptions } from '../../utils/crypto';
import confetti from 'canvas-confetti';

interface PasswordCloudViewProps {
  passwords: PasswordItem[];
  isLocked: boolean;
  pinCode: string;
  isBiometricEnabled: boolean;
  onUnlock: () => void;
  onLock: () => void;
  onAddPassword: (item: Omit<PasswordItem, 'id' | 'updatedAt'>) => void;
  onUpdatePassword: (id: string, item: Partial<PasswordItem>) => void;
  onDeletePassword: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const CATEGORIES: ('Semua' | PasswordCategory)[] = [
  'Semua',
  'Perbankan',
  'Sosial Media',
  'Email & Kerja',
  'E-Commerce',
  'Hiburan',
  'Lainnya',
];

export const PasswordCloudView: React.FC<PasswordCloudViewProps> = ({
  passwords,
  isLocked,
  pinCode,
  isBiometricEnabled,
  onUnlock,
  onLock,
  onAddPassword,
  onUpdatePassword,
  onDeletePassword,
  onToggleFavorite,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | PasswordCategory>('Semua');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formCategory, setFormCategory] = useState<PasswordCategory>('Sosial Media');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNote, setFormNote] = useState('');

  // Generator Options State
  const [genOptions, setGenOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUpper: true,
    includeLower: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  const [generatedPass, setGeneratedPass] = useState(() =>
    generateStrongPassword({ length: 16, includeUpper: true, includeLower: true, includeNumbers: true, includeSymbols: true })
  );

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === pinCode) {
      setPinError(false);
      setPinInput('');
      onUnlock();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleBiometricUnlock = () => {
    // Biometric fingerprint simulation
    onUnlock();
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openAddModal = () => {
    setFormTitle('');
    setFormUsername('');
    setFormPassword(generateStrongPassword(genOptions));
    setFormCategory('Sosial Media');
    setFormWebsite('');
    setFormNote('');
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: PasswordItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormUsername(item.username);
    setFormPassword(item.password);
    setFormCategory(item.category);
    setFormWebsite(item.website || '');
    setFormNote(item.note || '');
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPassword) return;

    if (editingItem) {
      onUpdatePassword(editingItem.id, {
        title: formTitle,
        username: formUsername,
        password: formPassword,
        category: formCategory,
        website: formWebsite,
        note: formNote,
      });
    } else {
      onAddPassword({
        title: formTitle,
        username: formUsername,
        password: formPassword,
        category: formCategory,
        website: formWebsite,
        note: formNote,
        isFavorite: false,
      });
      confetti({ particleCount: 30, spread: 50 });
    }
    setIsAddModalOpen(false);
  };

  const handleGenerateNew = () => {
    const newPass = generateStrongPassword(genOptions);
    setGeneratedPass(newPass);
  };

  const applyGeneratedPass = () => {
    setFormPassword(generatedPass);
    setIsGeneratorOpen(false);
  };

  // Filtered Passwords
  const filtered = passwords.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.website && item.website.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // Security stats
  const strongCount = passwords.filter((p) => evaluatePasswordStrength(p.password).score >= 75).length;
  const weakCount = passwords.filter((p) => evaluatePasswordStrength(p.password).score < 55).length;
  const securityPercent = passwords.length > 0 ? Math.round((strongCount / passwords.length) * 100) : 100;

  // 1. LOCKED VAULT VIEW
  if (isLocked) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-slate-100 animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-bold text-white">Password Cloud Terkunci</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Masukkan Master PIN Anda untuk mengakses brankas kata sandi digital.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="flex justify-center gap-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-40 text-center tracking-[1em] text-2xl font-mono py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-medium">
                PIN salah! Coba default: <span className="underline">1234</span>
              </p>
            )}

            <button
              type="submit"
              disabled={pinInput.length < 4}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-md"
            >
              Buka Brankas
            </button>
          </form>

          {isBiometricEnabled && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleBiometricUnlock}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Buka dengan Sidik Jari</span>
              </button>
            </div>
          )}

          <p className="text-[10px] text-slate-500 mt-4">
            Keamanan terenkripsi client-side dengan algoritma sandi standar industri.
          </p>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED VAULT VIEW
  return (
    <div className="space-y-4 pb-24 text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Banner with Health Score & Lock Button */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Audit Keamanan</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {securityPercent}% Aman
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {strongCount} kuat, {weakCount} perlu diperkuat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onLock}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Kunci Brankas"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Security bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${securityPercent}%` }}
          />
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari akun, username, atau website..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Password Cards List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <KeyRound className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">Tidak ada password ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau tambahkan akun baru.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isRevealed = revealedIds[item.id] || false;
            const strength = evaluatePasswordStrength(item.password);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 shadow-md transition space-y-2.5"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs uppercase">
                      {item.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        {item.title}
                        {item.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                      </h4>
                      <span className="text-[10px] text-purple-400 font-medium">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition"
                      title="Favorit"
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePassword(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Username Row */}
                <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                  <span className="text-slate-400 text-[11px]">User / Email</span>
                  <div className="flex items-center gap-2 font-mono text-slate-200 truncate max-w-[200px]">
                    <span className="truncate">{item.username}</span>
                    <button
                      onClick={() => handleCopy(item.username, `u-${item.id}`)}
                      className="text-slate-400 hover:text-emerald-400 transition"
                      title="Salin Username"
                    >
                      {copiedId === `u-${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Password Row with Reveal & Copy */}
                <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Password</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${strength.color} bg-slate-800`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-200 text-xs truncate max-w-[160px]">
                      {isRevealed ? item.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title={isRevealed ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(item.password, item.id)}
                      className="p-1 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600 hover:text-white transition"
                      title="Salin Password"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Optional Notes or Website */}
                {(item.note || item.website) && (
                  <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                    {item.note && <span className="truncate max-w-[240px] italic">"{item.note}"</span>}
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-purple-400 hover:underline ml-auto"
                      >
                        <span>Buka Web</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT PASSWORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>{editingItem ? 'Edit Password' : 'Simpan Password Baru'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Layanan / Akun *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: BCA Mobile, Instagram, Gmail"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Username / Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="user@email.com"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PasswordCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Perbankan">Perbankan</option>
                    <option value="Sosial Media">Sosial Media</option>
                    <option value="Email & Kerja">Email & Kerja</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Hiburan">Hiburan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Kata Sandi *</label>
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(true)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generator Kuat</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-emerald-400 focus:outline-none focus:border-purple-500"
                />
                {formPassword && (
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Kekuatan Sandi:</span>
                    <span className={`font-bold ${evaluatePasswordStrength(formPassword).color}`}>
                      {evaluatePasswordStrength(formPassword).label} ({evaluatePasswordStrength(formPassword).score}%)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">URL Website (Opsional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Catatan Tambahan / PIN (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Petunjuk 2FA, PIN sekunder..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
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
                  className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATOR POPUP MODAL */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Smart Password Generator</span>
              </h4>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Password Preview Box */}
            <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-3 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-emerald-400 break-all select-all">
                {generatedPass}
              </span>
              <button
                type="button"
                onClick={handleGenerateNew}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
                title="Acak Ulang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sliders & Toggles */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Panjang Karakter:</span>
                <span className="font-bold text-purple-400 font-mono">{genOptions.length}</span>
              </div>
              <input
                type="range"
                min={8}
                max={32}
                value={genOptions.length}
                onChange={(e) => {
                  const len = Number(e.target.value);
                  setGenOptions((prev) => ({ ...prev, length: len }));
                  setGeneratedPass(generateStrongPassword({ ...genOptions, length: len }));
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.includeUpper}
                    onChange={(e) => {
                      const next = { ...genOptions, includeUpper: e.target.checked };
                      setGenOptions(next);
                      setGeneratedPass(generateStrongPassword(next));
                    }}
                    className="rounded accent-purple-500"
                  />
                  <span>Huruf Besar (A-Z)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.includeNumbers}
                    onChange={(e) => {
                      const next = { ...genOptions, includeNumbers: e.target.checked };
                      setGenOptions(next);
                      setGeneratedPass(generateStrongPassword(next));
                    }}
                    className="rounded accent-purple-500"
                  />
                  <span>Angka (0-9)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.includeSymbols}
                    onChange={(e) => {
                      const next = { ...genOptions, includeSymbols: e.target.checked };
                      setGenOptions(next);
                      setGeneratedPass(generateStrongPassword(next));
                    }}
                    className="rounded accent-purple-500"
                  />
                  <span>Simbol (!@#$)</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={applyGeneratedPass}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
            >
              Gunakan Password Ini
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
