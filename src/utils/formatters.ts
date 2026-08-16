export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getGreetingIndo(): { greeting: string; icon: string; sub: string } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) {
    return { greeting: 'Selamat Pagi', icon: '🌅', sub: 'Mulai hari dengan fokus & semangat!' };
  } else if (hour >= 11 && hour < 15) {
    return { greeting: 'Selamat Siang', icon: '☀️', sub: 'Cek progres tugas & makan siang bergizi.' };
  } else if (hour >= 15 && hour < 19) {
    return { greeting: 'Selamat Sore', icon: '🌇', sub: 'Waktunya rekap aktivitas & persiapan santai.' };
  } else {
    return { greeting: 'Selamat Malam', icon: '🌙', sub: 'Istirahat yang cukup untuk esok hari.' };
  }
}
