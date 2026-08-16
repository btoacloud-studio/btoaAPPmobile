export interface PasswordStrengthResult {
  score: number; // 0 - 100
  label: 'Sangat Lemah' | 'Lemah' | 'Cukup' | 'Kuat' | 'Sangat Aman';
  color: string;
  bgLight: string;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Sangat Lemah',
      color: 'text-rose-500',
      bgLight: 'bg-rose-500',
      feedback: ['Masukkan kata sandi'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 25;
  else feedback.push('Gunakan minimal 8 karakter');

  if (password.length >= 14) score += 15;
  if (password.length >= 18) score += 10;

  // Character variations
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Tambahkan huruf kecil');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Tambahkan huruf besar (kapital)');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Tambahkan angka (0-9)');

  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Tambahkan simbol khusus (@, #, $, !)');

  // Deduct for obvious weak patterns
  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score = Math.min(score, 40);
  }

  score = Math.min(Math.max(score, 5), 100);

  if (score < 30) {
    return { score, label: 'Sangat Lemah', color: 'text-rose-500', bgLight: 'bg-rose-500', feedback };
  } else if (score < 55) {
    return { score, label: 'Lemah', color: 'text-amber-500', bgLight: 'bg-amber-500', feedback };
  } else if (score < 75) {
    return { score, label: 'Cukup', color: 'text-yellow-500', bgLight: 'bg-yellow-500', feedback };
  } else if (score < 90) {
    return { score, label: 'Kuat', color: 'text-emerald-500', bgLight: 'bg-emerald-500', feedback: feedback.length ? feedback : ['Kata sandi sudah kuat'] };
  } else {
    return { score, label: 'Sangat Aman', color: 'text-teal-600', bgLight: 'bg-teal-600', feedback: ['Sangat tangguh & terlindungi'] };
  }
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUpper: boolean;
  includeLower: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export function generateStrongPassword(options: PasswordGeneratorOptions): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // avoiding I and O
  const lower = 'abcdefghijkmnopqrstuvwxyz'; // avoiding l
  const numbers = '23456789'; // avoiding 1 and 0
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charPool = '';
  if (options.includeUpper) charPool += upper;
  if (options.includeLower) charPool += lower;
  if (options.includeNumbers) charPool += numbers;
  if (options.includeSymbols) charPool += symbols;

  if (!charPool) charPool = lower + numbers;

  let result = '';
  const cryptoObj = window.crypto || (window as any).msCrypto;
  
  if (cryptoObj && cryptoObj.getRandomValues) {
    const randomBuffer = new Uint32Array(options.length);
    cryptoObj.getRandomValues(randomBuffer);
    for (let i = 0; i < options.length; i++) {
      result += charPool[randomBuffer[i] % charPool.length];
    }
  } else {
    for (let i = 0; i < options.length; i++) {
      result += charPool.charAt(Math.floor(Math.random() * charPool.length));
    }
  }

  return result;
}
