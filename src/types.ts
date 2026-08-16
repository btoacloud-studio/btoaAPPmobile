export type TabType = 'dashboard' | 'passwords' | 'notes' | 'finance' | 'travel' | 'profile';

export type PasswordCategory = 'Sosial Media' | 'Perbankan' | 'Email & Kerja' | 'Hiburan' | 'E-Commerce' | 'Lainnya';

export interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string;
  category: PasswordCategory;
  website?: string;
  note?: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type NoteCategory = 'Ide' | 'Kerja' | 'Pribadi' | 'Belanja' | 'Belajar';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type PriorityLevel = 'Tinggi' | 'Sedang' | 'Rendah';

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: PriorityLevel;
  dueDate: string;
  category: string;
  subtasks: SubTask[];
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export type FinanceCategory = 
  | 'Makanan & Minuman' 
  | 'Transportasi' 
  | 'Belanja' 
  | 'Tagihan & Utilitas' 
  | 'Hiburan' 
  | 'Gaji & Pendapatan' 
  | 'Investasi' 
  | 'Kesehatan' 
  | 'Lainnya';

export type PaymentMethod = 'BCA' | 'Mandiri' | 'GoPay' | 'OVO' | 'Dana' | 'ShopeePay' | 'Cash / Tunai' | 'Lainnya';

export interface FinanceTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: FinanceCategory;
  paymentMethod: PaymentMethod;
  date: string;
  note?: string;
}

export type TransportMode = 'motor' | 'car' | 'train' | 'flight' | 'walk';

export interface PackingItem {
  id: string;
  item: string;
  packed: boolean;
}

export interface TravelTrip {
  id: string;
  destination: string;
  title: string;
  startDate: string;
  endDate: string;
  transportMode: TransportMode;
  distanceKm: number;
  totalCost: number;
  status: 'completed' | 'ongoing' | 'planned';
  highlights: string[];
  packingList: PackingItem[];
  notes: string;
  coverEmoji: string;
  locationTag: string;
}

export interface HabitItem {
  id: string;
  name: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  occupation: string;
  pinCode: string;
  isVaultLocked: boolean;
  isBiometricEnabled: boolean;
  currency: string;
  hapticsEnabled: boolean;
}

export interface NusaLifeAppState {
  passwords: PasswordItem[];
  notes: NoteItem[];
  todos: TodoItem[];
  transactions: FinanceTransaction[];
  trips: TravelTrip[];
  habits: HabitItem[];
  profile: UserProfile;
}
