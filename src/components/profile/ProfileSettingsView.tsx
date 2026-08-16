import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  KeyRound, 
  Download, 
  Upload, 
  RotateCcw, 
  Smartphone, 
  HardDrive, 
  Sparkles, 
  Fingerprint, 
  Lock, 
  Check, 
  Edit2, 
  Save, 
  Globe, 
  Moon, 
  Zap, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, NusaLifeAppState } from '../../types';
import { exportAppStateAsJson, getStorageUsageBytes } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface ProfileSettingsViewProps {
  profile: UserProfile;
  appState: NusaLifeAppState;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onResetData: () => void;
  onImportData: (importedState: NusaLifeAppState) => void;
  onLockVault: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  appState,
  onUpdateProfile,
  onResetData,
  onImportData,
  onLockVault,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [occupation, setOccupation] = useState(profile.occupation);
  const [bio, setBio] = useState(profile.bio);

  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSavedToast, setPinSavedToast] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const storageBytes = getStorageUsageBytes();
  const storageKb = (storageBytes / 1024).toFixed(2);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      avatar,
      occupation,
      bio,
    });
    setIsEditingProfile(false);
    confetti({ particleCount: 25, spread: 50 });
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      onUpdateProfile({ pinCode: newPin });
      setNewPin('');
      setPinChangeOpen(false);
      setPinSavedToast(true);
      setTimeout(() => setPinSavedToast(false), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && (parsed.passwords || parsed.transactions || parsed.todos)) {
          onImportData(parsed);
          alert('Data NusaLife berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file JSON tidak valid untuk NusaLife.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-100 animate-in fade-in duration-300">
      
      {/* 1. Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/80 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-bold">
                ✓
              </span>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-white">{profile.name}</h2>
              <p className="text-xs text-emerald-400 font-medium">{profile.occupation}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? 'Batal' : 'Edit'}</span>
          </button>
        </div>

        {profile.bio && (
          <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed italic">
            "{profile.bio}"
          </p>
        )}

        {/* Edit Form Drawer */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Profesi / Pekerjaan</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">URL Avatar Foto</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Bio Singkat</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </form>
        )}
      </div>

      {/* 2. Security & PIN Settings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Keamanan & Brankas Password</span>
        </h3>

        {pinSavedToast && (
          <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Master PIN baru berhasil disimpan!</span>
          </div>
        )}

        <div className="space-y-2">
          {/* Master PIN Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Master PIN Cloud</span>
                <span className="text-[10px] text-slate-400">Saat ini: •••• ({profile.pinCode})</span>
              </div>
            </div>
            <button
              onClick={() => setPinChangeOpen(!pinChangeOpen)}
              className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold transition"
            >
              Ubah PIN
            </button>
          </div>

          {/* Change PIN Inline Input */}
          {pinChangeOpen && (
            <form onSubmit={handleSaveNewPin} className="p-3 bg-slate-950 border border-purple-500/40 rounded-xl space-y-2">
              <label className="text-[11px] text-slate-300 block font-medium">
                Masukkan 4 Digit Master PIN Baru:
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-32 px-3 py-1.5 text-center font-mono tracking-widest text-base bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={newPin.length !== 4}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          {/* Biometric Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2.5">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Buka dengan Biometrik</span>
                <span className="text-[10px] text-slate-400">Sidik jari / Face Unlock PWA</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isBiometricEnabled}
                onChange={(e) => onUpdateProfile({ isBiometricEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Lock Vault Now Button */}
          <button
            onClick={onLockVault}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Kunci Brankas Password Sekarang</span>
          </button>
        </div>
      </div>

      {/* 3. Data Backup & Storage Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Penyimpanan & Cadangan Data</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{storageKb} KB Terpakai</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Export Backup */}
          <button
            onClick={() => exportAppStateAsJson(appState)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition group"
          >
            <Download className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Ekspor Backup</span>
            <span className="text-[9px] text-slate-400">Unduh file .JSON</span>
          </button>

          {/* Import Backup */}
          <label className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition cursor-pointer group">
            <Upload className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Pulihkan Data</span>
            <span className="text-[9px] text-slate-400">Impor file .JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Reset Data Confirmation */}
        <div className="pt-2 border-t border-slate-800">
          {!resetConfirmOpen ? (
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data ke Contoh Awal</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2">
              <p className="text-xs text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Yakin ingin mereset seluruh data kembali ke data contoh?</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="w-1/2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setResetConfirmOpen(false);
                  }}
                  className="w-1/2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Ya, Reset Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. App Info & PWA Status */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>NusaLife Digital Manager PWA</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Versi 1.0.0 • Didukung oleh Google Gemini AI • Offline First
        </p>
      </div>

    </div>
  );
};
