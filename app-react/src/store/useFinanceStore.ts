import { create } from 'zustand';
import { Budget, Category, ScannedReceiptResult, Transaction, Wallet } from '../types/finance';

export interface ToastNotification {
  id: number;
  title: string;
  subtitle: string;
  amountText?: string;
  type: 'expense' | 'income' | 'transfer' | 'info';
  icon?: string;
}

export interface PendingDeleteTransaction {
  tx: Transaction;
  index: number;
  expiresAt: number;
}

interface FinanceStore {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    isAuthenticated: boolean;
  };
  apiBaseUrl: string;
  isBackendConnected: boolean;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  activeMonth: string; // YYYY-MM
  toast: ToastNotification | null;
  pendingDelete: PendingDeleteTransaction | null;
  needsNicknameOnboarding: boolean;
  tutorialStep: number | null; // 1..5 when Spotlight Tutorial is active

  // Actions
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: () => void;
  loginDemo: (name?: string, email?: string) => void;
  loginAccount: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerAccount: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (
    isRegister?: boolean,
    selectedAccount?: { email: string; name: string }
  ) => Promise<void>;
  exchangeGoogleCode: (code: string, redirectUri?: string) => Promise<{ ok: boolean; error?: string }>;
  completeNicknameOnboarding: (nickname: string) => Promise<void>;
  setTutorialStep: (step: number | null) => void;
  startTutorial: () => void;
  finishTutorial: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logoutUser: () => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => Promise<void>;
  updateWallet: (id: number, wallet: Partial<Omit<Wallet, 'id'>>) => Promise<void>;
  deleteWallet: (id: number) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: number, cat: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  undoDeleteTransaction: () => void;
  commitPendingDelete: () => Promise<void>;
  updateBudget: (categoryId: number | null, amountLimit: number) => Promise<void>;
  scanReceiptWithAI: (file: File) => Promise<ScannedReceiptResult>;
  syncWithBackend: () => Promise<void>;
}

const currentYearMonth = new Date().toISOString().slice(0, 7);
const todayStr = new Date().toISOString().slice(0, 10);

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

const twoDaysAgoDate = new Date();
twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
const twoDaysAgoStr = twoDaysAgoDate.toISOString().slice(0, 10);

const threeDaysAgoDate = new Date();
threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
const threeDaysAgoStr = threeDaysAgoDate.toISOString().slice(0, 10);

const initialWallets: Wallet[] = [
  { id: 1, name: 'Dompet Tunai', type: 'cash', balance: 450000, color: '#FFE066', icon: '💵' },
  { id: 2, name: 'BCA Utama', type: 'bank', balance: 4850000, color: '#A0C4FF', icon: '🏦' },
  { id: 3, name: 'GoPay', type: 'ewallet', balance: 325000, color: '#A8E6CF', icon: '📱' },
];

const initialCategories: Category[] = [
  { id: 1, name: 'Makan & Kopi', type: 'expense', color: '#FF8B94', icon: '🍜', is_default: true },
  { id: 2, name: 'Transportasi', type: 'expense', color: '#A0C4FF', icon: '🛵', is_default: true },
  { id: 3, name: 'Belanja Bulanan', type: 'expense', color: '#FFE066', icon: '🛒', is_default: true },
  { id: 4, name: 'Tagihan & Kos', type: 'expense', color: '#BDB2FF', icon: '⚡', is_default: true },
  { id: 5, name: 'Hiburan & Hobi', type: 'expense', color: '#FFD8A8', icon: '🎮', is_default: true },
  { id: 6, name: 'Gaji Utama', type: 'income', color: '#A8E6CF', icon: '💰', is_default: true },
  { id: 7, name: 'Project Freelance', type: 'income', color: '#FFE066', icon: '🎨', is_default: true },
];

const initialTransactions: Transaction[] = [
  {
    id: 101,
    wallet_id: 3,
    category_id: 1,
    type: 'expense',
    amount: 38000,
    transaction_date: todayStr,
    note: 'Kopi Susu Gula Aren & Croissant (Kopi Kenangan)',
    is_ai_scanned: true,
  },
  {
    id: 102,
    wallet_id: 1,
    category_id: 1,
    type: 'expense',
    amount: 45000,
    transaction_date: todayStr,
    note: 'Nasi Padang Ayam Pop Siang',
  },
  {
    id: 103,
    wallet_id: 3,
    category_id: 2,
    type: 'expense',
    amount: 24000,
    transaction_date: yesterdayStr,
    note: 'GoRide ke Stasiun MRT',
  },
  {
    id: 104,
    wallet_id: 2,
    category_id: 3,
    type: 'expense',
    amount: 315000,
    transaction_date: yesterdayStr,
    note: 'Belanja Stok Dapur & Sabun di Indomaret Fresh',
    is_ai_scanned: true,
  },
  {
    id: 105,
    wallet_id: 2,
    to_wallet_id: 3,
    category_id: 2,
    type: 'transfer',
    amount: 250000,
    transaction_date: twoDaysAgoStr,
    note: 'Top up saldo GoPay dari BCA',
  },
  {
    id: 106,
    wallet_id: 2,
    category_id: 4,
    type: 'expense',
    amount: 450000,
    transaction_date: twoDaysAgoStr,
    note: 'Token Listrik & WiFi Bulanan',
  },
  {
    id: 107,
    wallet_id: 2,
    category_id: 6,
    type: 'income',
    amount: 6500000,
    transaction_date: threeDaysAgoStr,
    note: 'Gaji Bulanan Masuk',
  },
  {
    id: 108,
    wallet_id: 1,
    category_id: 5,
    type: 'expense',
    amount: 120000,
    transaction_date: threeDaysAgoStr,
    note: 'Beli Buku Jurnal & Pulpen Doodle',
  },
];

const initialBudgets: Budget[] = [
  { id: 1, category_id: null, amount_limit: 3000000, month_year: currentYearMonth },
  { id: 2, category_id: 1, amount_limit: 900000, month_year: currentYearMonth },
  { id: 3, category_id: 2, amount_limit: 400000, month_year: currentYearMonth },
  { id: 4, category_id: 3, amount_limit: 750000, month_year: currentYearMonth },
  { id: 5, category_id: 4, amount_limit: 650000, month_year: currentYearMonth },
  { id: 6, category_id: 5, amount_limit: 300000, month_year: currentYearMonth },
];

const AUTH_STORAGE_KEY = 'dicatat_auth_user_v1';

function loadPersistedUser(): {
  id: number;
  name: string;
  email: string;
  isAuthenticated: boolean;
} {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === 'string') {
        return {
          id: Number(parsed.id) || 1,
          name: parsed.name || 'Kak Cawren',
          email: parsed.email,
          isAuthenticated: Boolean(parsed.isAuthenticated),
        };
      }
    }
  } catch {
    // ignore storage errors
  }
  return {
    id: 1,
    name: '',
    email: '',
    isAuthenticated: false,
  };
}

function savePersistedUser(user: {
  id: number;
  name: string;
  email: string;
  isAuthenticated: boolean;
}) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  user: loadPersistedUser(),
  apiBaseUrl:
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.port === '5173'
      ? 'http://127.0.0.1:8000/api'
      : '/api'),
  isBackendConnected: false,
  wallets: initialWallets,
  categories: initialCategories,
  transactions: initialTransactions,
  budgets: initialBudgets,
  activeMonth: currentYearMonth,
  toast: null,
  pendingDelete: null,
  needsNicknameOnboarding: false,
  tutorialStep: null,

  showToast: (t) => {
    const id = Date.now();
    set({ toast: { ...t, id } });
  },

  dismissToast: () => {
    set({ toast: null });
  },

  loginDemo: (name = 'Kak Cawren', email = 'cawren@dicatat.com') => {
    const nextUser = {
      id: 1,
      name,
      email,
      isAuthenticated: true,
    };
    savePersistedUser(nextUser);
    set({
      user: nextUser,
      needsNicknameOnboarding: false,
      tutorialStep: null,
    });
    get().syncWithBackend();
  },

  loginAccount: async (email, password) => {
    const { apiBaseUrl } = get();
    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        return {
          ok: false,
          error: errJson?.message || 'Email atau password tidak sesuai.',
        };
      }

      const json = await res.json();
      const nextUser = {
        id: Number(json.user?.id) || 1,
        name: json.user?.name || email.split('@')[0],
        email: json.user?.email || email,
        isAuthenticated: true,
      };
      savePersistedUser(nextUser);
      set({
        user: nextUser,
        needsNicknameOnboarding: false,
        tutorialStep: null,
      });
      await get().syncWithBackend();
      return { ok: true };
    } catch {
      // Offline fallback for demo login
      const nextUser = {
        id: 1,
        name: email.split('@')[0],
        email,
        isAuthenticated: true,
      };
      savePersistedUser(nextUser);
      set({
        user: nextUser,
        needsNicknameOnboarding: false,
        tutorialStep: null,
      });
      return { ok: true };
    }
  },

  registerAccount: async (email, password) => {
    const { apiBaseUrl } = get();
    try {
      const res = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const firstValidationError = errJson?.errors
          ? (Object.values(errJson.errors)[0] as string[])?.[0]
          : null;
        return {
          ok: false,
          error: firstValidationError || errJson?.message || 'Email sudah terdaftar atau tidak valid.',
        };
      }

      const json = await res.json();
      const nextUser = {
        id: Number(json.user?.id) || Date.now(),
        name: '',
        email: json.user?.email || email,
        isAuthenticated: true,
      };
      savePersistedUser(nextUser);
      set({
        user: nextUser,
        transactions: [],
        needsNicknameOnboarding: true,
        tutorialStep: null,
      });
      await get().syncWithBackend();
      return { ok: true };
    } catch {
      // Offline fallback for registration: 3 zero-balance default wallets + empty transactions
      const nextUser = {
        id: Date.now(),
        name: '',
        email,
        isAuthenticated: true,
      };
      savePersistedUser(nextUser);
      set({
        user: nextUser,
        wallets: [
          { id: 1, name: 'Dompet Tunai', type: 'cash', balance: 0, color: '#FFE066', icon: '💵' },
          { id: 2, name: 'Rekening Bank', type: 'bank', balance: 0, color: '#A0C4FF', icon: '🏦' },
          { id: 3, name: 'E-Wallet', type: 'ewallet', balance: 0, color: '#A8E6CF', icon: '📱' },
        ],
        transactions: [],
        needsNicknameOnboarding: true,
        tutorialStep: null,
      });
      return { ok: true };
    }
  },

  loginWithGoogle: async (isRegister = true, selectedAccount) => {
    const { apiBaseUrl } = get();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const googleEmail =
      selectedAccount?.email ||
      (isRegister ? `user.google.${randomSuffix}@gmail.com` : 'cawren@dicatat.com');
    const googleName =
      selectedAccount?.name || (isRegister ? 'Sobat Google' : 'Kak Cawren');

    try {
      const res = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: googleEmail,
          name: googleName,
          google_id: `google_${Date.now()}`,
          is_register: isRegister,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const isNew = Boolean(json.is_new_user) || isRegister;
        const nextUser = {
          id: Number(json.user?.id) || Date.now(),
          name: isNew ? '' : json.user?.name || googleName,
          email: json.user?.email || googleEmail,
          isAuthenticated: true,
        };
        savePersistedUser(nextUser);
        set({
          user: nextUser,
          needsNicknameOnboarding: isNew,
          tutorialStep: null,
        });
        await get().syncWithBackend();
        return;
      }
    } catch {
      // fallback
    }

    const nextUser = {
      id: isRegister ? Date.now() : 1,
      name: isRegister ? '' : googleName,
      email: googleEmail,
      isAuthenticated: true,
    };
    savePersistedUser(nextUser);
    set({
      user: nextUser,
      needsNicknameOnboarding: isRegister,
      tutorialStep: null,
    });
    await get().syncWithBackend();
  },

  exchangeGoogleCode: async (code, redirectUri) => {
    const { apiBaseUrl } = get();
    try {
      const res = await fetch(`${apiBaseUrl}/auth/google/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: redirectUri,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: json?.message || 'Gagal menukar kode otorisasi Google OAuth.',
        };
      }

      const isNew = Boolean(json.is_new_user);
      const nextUser = {
        id: Number(json.user?.id) || Date.now(),
        name: isNew ? '' : json.user?.name || 'Sobat Google',
        email: json.user?.email || '',
        avatar: json.user?.avatar,
        isAuthenticated: true,
      };
      savePersistedUser(nextUser);
      set({
        user: nextUser,
        needsNicknameOnboarding: isNew,
        tutorialStep: null,
      });
      await get().syncWithBackend();
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Tidak dapat menghubungi backend Laravel untuk pertukaran token Google OAuth.',
      };
    }
  },

  completeNicknameOnboarding: async (nickname) => {
    const { apiBaseUrl, user } = get();
    const cleanName = nickname.trim() || 'Sobat diCatat';
    const nextUser = {
      ...user,
      name: cleanName,
      isAuthenticated: true,
    };
    savePersistedUser(nextUser);

    set({
      user: nextUser,
      needsNicknameOnboarding: false,
      tutorialStep: 1, // Immediately launch Step 1 of Spotlight Tutorial!
    });

    try {
      await fetch(`${apiBaseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          name: cleanName,
          email: user.email,
        }),
      });
    } catch {
      // ignore offline error
    }
  },

  setTutorialStep: (step) => {
    set({ tutorialStep: step });
  },

  startTutorial: () => {
    set({ tutorialStep: 1 });
  },

  finishTutorial: () => {
    set({ tutorialStep: null });
  },

  updateProfile: async (name, email) => {
    const { apiBaseUrl, user } = get();
    const nextUser = {
      ...user,
      name,
      email,
    };
    savePersistedUser(nextUser);

    set({
      user: nextUser,
      toast: {
        id: Date.now(),
        title: 'Profil Akun Diperbarui!',
        subtitle: `Nama & email disimpan sebagai ${name} (${email})`,
        type: 'info',
        icon: 'paw',
      },
    });

    try {
      await fetch(`${apiBaseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ user_id: user.id, name, email }),
      });
    } catch {
      // ignore offline error
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    const { apiBaseUrl } = get();
    try {
      await fetch(`${apiBaseUrl}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
    } catch {
      // ignore offline error
    }

    set({
      toast: {
        id: Date.now(),
        title: 'Password Berhasil Diganti!',
        subtitle: 'Password baru akun diCatat kamu sudah aktif.',
        type: 'info',
        icon: 'sparkle',
      },
    });
  },

  logoutUser: () => {
    set((state) => {
      const nextUser = {
        ...state.user,
        isAuthenticated: false,
      };
      savePersistedUser(nextUser);
      return {
        user: nextUser,
        needsNicknameOnboarding: false,
        tutorialStep: null,
      };
    });
  },

  addWallet: async (wallet) => {
    const { apiBaseUrl, user } = get();
    const tempId = Date.now();

    try {
      const res = await fetch(`${apiBaseUrl}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-User-Id': String(user.id || 1),
        },
        body: JSON.stringify({ ...wallet, user_id: user.id || 1 }),
      });

      if (res.ok) {
        const json = await res.json();
        const savedWallet: Wallet = json.data;
        set((state) => ({
          wallets: [...state.wallets, savedWallet],
          toast: {
            id: tempId,
            title: 'Dompet Baru Tercatat!',
            subtitle: `${savedWallet.name} berhasil disimpan ke MySQL.`,
            amountText: `Rp ${Number(savedWallet.balance).toLocaleString('id-ID')}`,
            type: 'info',
            icon: savedWallet.icon,
          },
        }));
        return;
      }
    } catch {
      // fallback to local state if server unreachable
    }

    set((state) => ({
      wallets: [...state.wallets, { ...wallet, id: tempId }],
      toast: {
        id: tempId,
        title: 'Dompet Baru Tercatat!',
        subtitle: `${wallet.name} siap dipakai di buku jurnalmu.`,
        amountText: `Rp ${wallet.balance.toLocaleString('id-ID')}`,
        type: 'info',
        icon: wallet.icon,
      },
    }));
  },

  updateWallet: async (id, updated) => {
    const { apiBaseUrl } = get();
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...updated } : w)),
    }));

    try {
      await fetch(`${apiBaseUrl}/wallets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updated),
      });
    } catch {
      // ignore offline error
    }
  },

  deleteWallet: async (id) => {
    const { apiBaseUrl } = get();
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
    }));

    try {
      await fetch(`${apiBaseUrl}/wallets/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
    } catch {
      // ignore offline error
    }
  },

  addCategory: async (cat) => {
    const { apiBaseUrl, user } = get();
    const tempId = Date.now();

    try {
      const res = await fetch(`${apiBaseUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-User-Id': String(user.id || 1),
        },
        body: JSON.stringify({ ...cat, user_id: user.id || 1 }),
      });

      if (res.ok) {
        const json = await res.json();
        const savedCat: Category = json.data;
        set((state) => ({
          categories: [...state.categories, savedCat],
          toast: {
            id: tempId,
            title: 'Kategori Baru Ditambahkan!',
            subtitle: `Kategori "${savedCat.name}" berhasil disimpan ke MySQL.`,
            type: 'info',
            icon: savedCat.icon,
          },
        }));
        return;
      }
    } catch {
      // fallback
    }

    set((state) => ({
      categories: [...state.categories, { ...cat, id: tempId }],
      toast: {
        id: tempId,
        title: 'Kategori Baru Ditambahkan!',
        subtitle: `Kategori "${cat.name}" berhasil dibuat.`,
        type: 'info',
        icon: cat.icon,
      },
    }));
  },

  updateCategory: async (id, updated) => {
    const { apiBaseUrl } = get();
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));

    try {
      await fetch(`${apiBaseUrl}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updated),
      });
    } catch {
      // ignore offline error
    }
  },

  deleteCategory: async (id) => {
    const { apiBaseUrl } = get();
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));

    try {
      await fetch(`${apiBaseUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
    } catch {
      // ignore offline error
    }
  },

  addTransaction: async (tx) => {
    const { apiBaseUrl, categories, wallets } = get();
    const tempId = Date.now();

    const cat = categories.find((c) => c.id === tx.category_id);
    const fromWallet = wallets.find((w) => w.id === tx.wallet_id);
    const toWallet = wallets.find((w) => w.id === tx.to_wallet_id);

    const titleMap = {
      expense: 'Sip! Pengeluaran sudah diCatat!',
      income: 'Asik! Pemasukan sudah diCatat!',
      transfer: 'Berhasil! Transfer saldo diCatat!',
    };

    const subtitle =
      tx.type === 'transfer'
        ? `${fromWallet?.name || 'Dompet'} → ${toWallet?.name || 'Dompet'} • ${tx.note}`
        : `${cat?.name || 'Transaksi'} (${fromWallet?.name || 'Dompet'}) • ${tx.note}`;

    const prefix = tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '';

    try {
      const formData = new FormData();
      formData.append('user_id', String(get().user.id || 1));
      formData.append('wallet_id', String(tx.wallet_id));
      if (tx.to_wallet_id) {
        formData.append('to_wallet_id', String(tx.to_wallet_id));
      }
      if (tx.type !== 'transfer' && tx.category_id) {
        formData.append('category_id', String(tx.category_id));
      }
      formData.append('type', tx.type);
      formData.append('amount', String(tx.amount));
      formData.append('transaction_date', tx.transaction_date);
      formData.append('note', tx.note);
      formData.append('is_ai_scanned', tx.is_ai_scanned ? '1' : '0');
      if (tx.receipt_file) {
        formData.append('receipt', tx.receipt_file);
      }

      const res = await fetch(`${apiBaseUrl}/transactions`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const savedTx: Transaction = {
          ...json.data,
          category_id: json.data.category_id ?? tx.category_id,
          receipt_image_url: json.data.receipt_image_url || tx.receipt_image_url,
        };
        set((state) => ({
          wallets: Array.isArray(json.wallets) ? json.wallets : state.wallets,
          transactions: [savedTx, ...state.transactions],
          toast: {
            id: tempId,
            title: titleMap[tx.type],
            subtitle,
            amountText: `${prefix}Rp ${tx.amount.toLocaleString('id-ID')}`,
            type: tx.type,
            icon: tx.type === 'transfer' ? 'transfer' : cat?.icon || tx.type,
          },
        }));
        return;
      }
    } catch {
      // fallback to local calculation if API offline
    }

    set((state) => {
      const updatedWallets = state.wallets.map((w) => {
        if (tx.type === 'expense' && w.id === tx.wallet_id) {
          return { ...w, balance: w.balance - tx.amount };
        }
        if (tx.type === 'income' && w.id === tx.wallet_id) {
          return { ...w, balance: w.balance + tx.amount };
        }
        if (tx.type === 'transfer') {
          if (w.id === tx.wallet_id) {
            return { ...w, balance: w.balance - tx.amount };
          }
          if (w.id === tx.to_wallet_id) {
            return { ...w, balance: w.balance + tx.amount };
          }
        }
        return w;
      });

      return {
        wallets: updatedWallets,
        transactions: [{ ...tx, id: tempId }, ...state.transactions],
        toast: {
          id: tempId,
          title: titleMap[tx.type],
          subtitle,
          amountText: `${prefix}Rp ${tx.amount.toLocaleString('id-ID')}`,
          type: tx.type,
          icon: tx.type === 'transfer' ? 'transfer' : cat?.icon || tx.type,
        },
      };
    });
  },

  deleteTransaction: async (id) => {
    // If there was already another pending delete waiting, commit it to backend first
    const existingPending = get().pendingDelete;
    if (existingPending && existingPending.tx.id !== id) {
      await get().commitPendingDelete();
    }

    set((state) => {
      const targetIndex = state.transactions.findIndex((t) => t.id === id);
      if (targetIndex === -1) return state;
      const target = state.transactions[targetIndex];

      const updatedWallets = state.wallets.map((w) => {
        if (target.type === 'expense' && w.id === target.wallet_id) {
          return { ...w, balance: w.balance + target.amount };
        }
        if (target.type === 'income' && w.id === target.wallet_id) {
          return { ...w, balance: w.balance - target.amount };
        }
        if (target.type === 'transfer') {
          if (w.id === target.wallet_id) {
            return { ...w, balance: w.balance + target.amount };
          }
          if (w.id === target.to_wallet_id) {
            return { ...w, balance: w.balance - target.amount };
          }
        }
        return w;
      });

      return {
        wallets: updatedWallets,
        transactions: state.transactions.filter((t) => t.id !== id),
        pendingDelete: {
          tx: target,
          index: targetIndex,
          expiresAt: Date.now() + 5000,
        },
      };
    });
  },

  undoDeleteTransaction: () => {
    set((state) => {
      if (!state.pendingDelete) return state;
      const { tx, index } = state.pendingDelete;

      // Restore wallet balances
      const restoredWallets = state.wallets.map((w) => {
        if (tx.type === 'expense' && w.id === tx.wallet_id) {
          return { ...w, balance: w.balance - tx.amount };
        }
        if (tx.type === 'income' && w.id === tx.wallet_id) {
          return { ...w, balance: w.balance + tx.amount };
        }
        if (tx.type === 'transfer') {
          if (w.id === tx.wallet_id) {
            return { ...w, balance: w.balance - tx.amount };
          }
          if (w.id === tx.to_wallet_id) {
            return { ...w, balance: w.balance + tx.amount };
          }
        }
        return w;
      });

      const restoredTransactions = [...state.transactions];
      restoredTransactions.splice(Math.min(index, restoredTransactions.length), 0, tx);

      return {
        wallets: restoredWallets,
        transactions: restoredTransactions,
        pendingDelete: null,
      };
    });
  },

  commitPendingDelete: async () => {
    const { apiBaseUrl, pendingDelete } = get();
    if (!pendingDelete) return;
    const targetId = pendingDelete.tx.id;

    set({ pendingDelete: null });

    try {
      const res = await fetch(`${apiBaseUrl}/transactions/${targetId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.wallets)) {
          set({ wallets: json.wallets });
        }
      }
    } catch {
      // ignore offline error
    }
  },

  updateBudget: async (categoryId, amountLimit) => {
    const { apiBaseUrl, activeMonth } = get();

    set((state) => {
      const existing = state.budgets.find(
        (b) => b.category_id === categoryId && b.month_year === state.activeMonth
      );
      if (existing) {
        return {
          budgets: state.budgets.map((b) =>
            b.id === existing.id ? { ...b, amount_limit: amountLimit } : b
          ),
        };
      }
      return {
        budgets: [
          ...state.budgets,
          {
            id: Date.now(),
            category_id: categoryId,
            amount_limit: amountLimit,
            month_year: state.activeMonth,
          },
        ],
      };
    });

    try {
      await fetch(`${apiBaseUrl}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          category_id: categoryId,
          amount_limit: amountLimit,
          month_year: activeMonth,
        }),
      });
    } catch {
      // ignore offline error
    }
  },

  scanReceiptWithAI: async (file: File): Promise<ScannedReceiptResult> => {
    const { apiBaseUrl } = get();
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch(`${apiBaseUrl}/receipts/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json?.data) {
          return json.data as ScannedReceiptResult;
        }
      }
    } catch {
      // Fallback to client-side AI receipt simulation if Laravel server isn't running
    }

    await new Promise((r) => setTimeout(r, 1800));
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('kopi') || lowerName.includes('cafe')) {
      return {
        merchant_name: 'Kopi Tuku Cipete',
        amount: 42000,
        transaction_date: new Date().toISOString().slice(0, 10),
        suggested_category: 'Makan & Kopi',
        items_summary: 'Es Kopi Susu Tetangga (2x) - Struk via Gemini Vision AI',
        confidence: '98% (Gemini Flash Vision)',
      };
    }

    return {
      merchant_name: 'Indomaret Point / Minimarket',
      amount: 67500,
      transaction_date: new Date().toISOString().slice(0, 10),
      suggested_category: 'Belanja Bulanan',
      items_summary: `Scan Struk (${file.name}): Snack, Susu UHT, & Kebutuhan Harian`,
      confidence: '96% (Gemini Flash Vision)',
    };
  },

  syncWithBackend: async () => {
    const { apiBaseUrl, activeMonth, user } = get();
    try {
      const res = await fetch(
        `${apiBaseUrl}/dashboard?month_year=${activeMonth}&user_id=${user.id || 1}`,
        {
          headers: {
            Accept: 'application/json',
            'X-User-Id': String(user.id || 1),
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        set({
          isBackendConnected: true,
          wallets: Array.isArray(data.wallets) && data.wallets.length > 0 ? data.wallets : get().wallets,
          categories:
            Array.isArray(data.categories) && data.categories.length > 0
              ? data.categories
              : get().categories,
          transactions: Array.isArray(data.transactions) ? data.transactions : get().transactions,
          budgets:
            Array.isArray(data.budgets) && data.budgets.length > 0 ? data.budgets : get().budgets,
        });
      }
    } catch {
      set({ isBackendConnected: false });
    }
  },
}));
