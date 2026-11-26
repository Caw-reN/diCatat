import React, { useEffect, useMemo, useState } from 'react';
import { RoughNotation } from 'react-rough-notation';
import {
  Calendar as CalendarIcon,
  Camera,
  Home,
  PieChart,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Target,
  FolderPlus,
  LogIn,
  Pencil,
  X,
  ReceiptText,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  User as UserIcon,
  Lock,
  LogOut,
  Check,
} from 'lucide-react';
import { useFinanceStore } from './store/useFinanceStore';
import { Transaction } from './types/finance';
import { MascotMood, MascotOren } from './components/MascotOren';
import { RoughDonutChart } from './components/RoughDonutChart';
import { QuickAddTransactionModal } from './components/QuickAddTransactionModal';
import { HandDrawnFilterDefs } from './components/HandDrawnFilterDefs';
import { HandDrawnSelect } from './components/HandDrawnSelect';
import { DoodleIcon } from './components/DoodleIcon';
import { HandDrawnToast } from './components/HandDrawnToast';
import { RoughProgressBar } from './components/RoughProgressBar';
import { PeekingMascotOren } from './components/PeekingMascotOren';
import { AuthGateScreen } from './components/AuthGateScreen';
import { SpotlightTutorialOverlay } from './components/SpotlightTutorialOverlay';
import { AdminDashboardPanel } from './components/AdminDashboardPanel';

type ActiveTab = 'home' | 'transactions' | 'stats' | 'budget' | 'wallets' | 'account';

export function App() {
  const {
    user,
    wallets,
    categories,
    transactions,
    budgets,
    activeMonth,
    isBackendConnected,
    syncWithBackend,
    addWallet,
    updateWallet,
    deleteWallet,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteTransaction,
    undoDeleteTransaction,
    commitPendingDelete,
    pendingDelete,
    updateBudget,
    loginDemo,
    updateProfile,
    changePassword,
    logoutUser,
    needsNicknameOnboarding,
    completeNicknameOnboarding,
    tutorialStep,
    setTutorialStep,
    startTutorial,
    finishTutorial,
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialMode, setModalInitialMode] = useState<'manual' | 'scan'>('manual');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState<number | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'all'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Selected Transaction for Detail Modal & Delete Confirmation + 5s Undo Countdown
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(5);

  useEffect(() => {
    setIsConfirmingDelete(false);
  }, [selectedTransaction]);

  useEffect(() => {
    if (!pendingDelete) return;

    const updateTimer = () => {
      const remainingMs = pendingDelete.expiresAt - Date.now();
      if (remainingMs <= 0) {
        commitPendingDelete();
      } else {
        setUndoSecondsLeft(Math.ceil(remainingMs / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);
    return () => clearInterval(interval);
  }, [pendingDelete, commitPendingDelete]);

  // New / Edit Wallet, Category & Budget Modal States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetCategoryId, setEditingBudgetCategoryId] = useState<number | null>(null);
  const [budgetAmountInput, setBudgetAmountInput] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<number | null>(null);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletType, setNewWalletType] = useState<'cash' | 'bank' | 'ewallet'>('ewallet');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🧋');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Account Page Form States (Name, Email, Change Password)
  const [accountName, setAccountName] = useState(user.name);
  const [accountEmail, setAccountEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [onboardingNickname, setOnboardingNickname] = useState('');

  useEffect(() => {
    setAccountName(user.name);
    setAccountEmail(user.email);
  }, [user.name, user.email]);

  useEffect(() => {
    if (tutorialStep !== null) {
      setActiveTab('home');
    }
  }, [tutorialStep]);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Totals calculation
  const totalBalance = useMemo(
    () => wallets.reduce((acc, w) => acc + w.balance, 0),
    [wallets]
  );

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.transaction_date.startsWith(activeMonth)),
    [transactions, activeMonth]
  );

  const totalMonthlyIncome = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0),
    [monthTransactions]
  );

  const totalMonthlyExpense = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0),
    [monthTransactions]
  );

  const overallBudget = useMemo(
    () =>
      budgets.find((b) => b.category_id === null && b.month_year === activeMonth)
        ?.amount_limit || 3000000,
    [budgets, activeMonth]
  );

  const budgetUsagePercent = useMemo(
    () => (overallBudget > 0 ? Math.round((totalMonthlyExpense / overallBudget) * 100) : 0),
    [totalMonthlyExpense, overallBudget]
  );

  // Reactive Mascot Mood & Smart Message based on budget health
  const mascotState: { mood: MascotMood; message: string } = useMemo(() => {
    if (transactions.length === 0) {
      return {
        mood: 'sleeping',
        message:
          'Meong~ Buku jurnalmu masih kosong nih. Yuk klik tombol (+) kuning buat catat pengeluaran atau scan struk pertamamu!',
      };
    }
    if (budgetUsagePercent >= 100) {
      return {
        mood: 'crying',
        message: `Meooong! Pengeluaran bulan ini sudah ${budgetUsagePercent}% dari budget (Rp${overallBudget.toLocaleString(
          'id-ID'
        )}). Yuk tahan jajan kopi & fokus kebutuhan pokok dulu!`,
      };
    }
    if (budgetUsagePercent >= 75) {
      return {
        mood: 'warning',
        message: `Waspada Bos! Budget bulanan sudah terpakai ${budgetUsagePercent}%. Sisa ruang aman tinggal Rp${Math.max(
          0,
          overallBudget - totalMonthlyExpense
        ).toLocaleString('id-ID')} lagi.`,
      };
    }
    return {
      mood: 'happy',
      message: `Mantap! Baru ${budgetUsagePercent}% budget bulanan yang terpakai. Dompetmu sehat & tabungan aman terkendali! ✨`,
    };
  }, [transactions.length, budgetUsagePercent, overallBudget, totalMonthlyExpense]);

  // Filtered transactions for "Semua Transaksi" page
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchQuery =
        !searchQuery ||
        tx.note.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType =
        selectedTypeFilter === 'all' || tx.type === selectedTypeFilter;
      const matchWallet =
        selectedWalletFilter === 'all' ||
        tx.wallet_id === selectedWalletFilter ||
        tx.to_wallet_id === selectedWalletFilter;
      const matchCat =
        selectedCategoryFilter === 'all' || tx.category_id === selectedCategoryFilter;
      return matchQuery && matchType && matchWallet && matchCat;
    });
  }, [transactions, searchQuery, selectedTypeFilter, selectedWalletFilter, selectedCategoryFilter]);

  // Donut Chart Slices
  const expenseChartData = useMemo(() => {
    const expenseCats = categories.filter((c) => c.type === 'expense');
    return expenseCats
      .map((cat) => {
        const sum = monthTransactions
          .filter((t) => t.type === 'expense' && t.category_id === cat.id)
          .reduce((acc, t) => acc + t.amount, 0);
        return {
          label: cat.name,
          value: sum,
          color: cat.color,
          icon: cat.icon,
        };
      })
      .filter((item) => item.value > 0);
  }, [categories, monthTransactions]);

  // Mini Daily Calendar Days for current month
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const list: { dateStr: string; dayNum: number; expenseSum: number; count: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(
        2,
        '0'
      )}`;
      const dayTxs = transactions.filter((t) => t.transaction_date === dateStr);
      const expenseSum = dayTxs
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      list.push({
        dateStr,
        dayNum: d,
        expenseSum,
        count: dayTxs.length,
      });
    }
    return list;
  }, [transactions]);

  const selectedDateTransactions = useMemo(
    () => transactions.filter((t) => t.transaction_date === selectedCalendarDate),
    [transactions, selectedCalendarDate]
  );

  const openQuickAdd = (mode: 'manual' | 'scan' = 'manual') => {
    setModalInitialMode(mode);
    setIsAddModalOpen(true);
  };

  // STANDALONE SEPARATE ADMIN ROUTE (/admin) — COMPLETELY SEPARATED FROM REGULAR USER UI
  const isAdminRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));

  if (isAdminRoute) {
    return (
      <>
        <HandDrawnFilterDefs />
        <HandDrawnToast />
        <AdminDashboardPanel />
      </>
    );
  }

  // FULL-SCREEN AUTH GATE WHEN USER HAS NOT LOGGED IN / REGISTERED YET (OR RETURNING FROM GOOGLE OAUTH CALLBACK)
  const isGoogleOAuthCallback =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/auth/google/callback') &&
    new URLSearchParams(window.location.search).has('code');

  if (!user.isAuthenticated || isGoogleOAuthCallback) {
    return (
      <>
        <HandDrawnFilterDefs />
        <HandDrawnToast />
        <AuthGateScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper text-ink pb-24 md:pb-0">
      <HandDrawnFilterDefs />
      <HandDrawnToast />

      {/* POPUP ONBOARDING: ISI NAMA PANGGILAN SETELAH DAFTAR AKUN BARU */}
      {needsNicknameOnboarding && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-ink/65 backdrop-blur-sm p-4">
          <div className="doodle-card w-full max-w-md bg-paper p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <span className="wobbly-box inline-block px-3 py-0.5 bg-highlight font-display font-bold text-xs text-ink">
                🐾 Langkah Pertama
              </span>
              <h2 className="font-display font-bold text-2xl text-ink pt-1">
                Kenalan Dulu Yuk!
              </h2>
            </div>

            <MascotOren
              mood="happy"
              size="md"
              message="Meong! Selamat datang di buku jurnal diCatat! Biar makin akrab, Si Oren harus panggil kamu siapa nih?"
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!onboardingNickname.trim()) return;
                completeNicknameOnboarding(onboardingNickname.trim());
                setOnboardingNickname('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-display font-bold mb-1.5">
                  Nama Panggilanmu
                </label>
                <div className="doodle-field">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={onboardingNickname}
                    onChange={(e) => setOnboardingNickname(e.target.value)}
                    placeholder="Contoh: Kak Cawren, Budi, Dinda..."
                    className="w-full px-4 py-3 text-sm sm:text-base font-display font-bold text-ink doodle-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!onboardingNickname.trim()}
                className="w-full py-3.5 doodle-btn bg-highlight font-display font-bold text-sm sm:text-base text-ink disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <DoodleIcon name="paw" className="w-5 h-5" />
                <span>Simpan Nama & Mulai Tur Singkat!</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SPOTLIGHT INTERACTIVE TUTORIAL OVERLAY (5 STEPS) */}
      <SpotlightTutorialOverlay
        isOpen={!needsNicknameOnboarding && tutorialStep !== null}
        step={tutorialStep || 1}
        onStepChange={(next) => setTutorialStep(next)}
        onFinish={finishTutorial}
        userName={user.name || 'Sobat'}
      />

      {/* DESKTOP SIDEBAR (Responsive Full-Screen Layout >= 768px) */}
      <aside className="doodle-sidebar hidden md:flex md:w-72 lg:w-80 shrink-0 flex-col justify-between p-6 bg-paper-warm">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="doodle-btn w-11 h-11 bg-highlight flex items-center justify-center">
                <DoodleIcon name="paw" className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl tracking-tight text-ink leading-none">
                  diCatat.
                </h1>
                <span className="text-xs font-hand text-ink-muted">
                  Buku Jurnal Keuangan Si Oren
                </span>
              </div>
            </div>
          </div>

          {/* Primary Quick Add & AI Scan Buttons */}
          <div className="space-y-2.5">
            <button
              id="tour-quick-add-desktop"
              onClick={() => openQuickAdd('manual')}
              className="w-full py-3 px-4 doodle-btn bg-highlight font-display font-bold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catat Transaksi Baru</span>
            </button>
            <button
              id="tour-ai-scan-desktop"
              onClick={() => openQuickAdd('scan')}
              className="w-full py-2.5 px-4 doodle-btn bg-sky-soft font-display font-bold text-xs flex items-center justify-center gap-2"
            >
              <DoodleIcon name="camera" className="w-4 h-4" />
              <span>Scan Struk Otomatis (AI)</span>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { id: 'home', label: 'Beranda Utama', icon: Home, badge: 'Utama', tourId: undefined },
              { id: 'transactions', label: 'Semua Transaksi', icon: ReceiptText, badge: `${transactions.length}`, tourId: undefined },
              { id: 'stats', label: 'Statistik & Kalender', icon: PieChart, badge: 'Insight', tourId: 'tour-stats-desktop' },
              { id: 'budget', label: 'Anggaran Bulanan', icon: Target, badge: `${budgetUsagePercent}%`, tourId: 'tour-budget-wallets-desktop' },
              { id: 'wallets', label: 'Dompet & Kategori', icon: WalletIcon, badge: `${wallets.length}`, tourId: undefined },
              { id: 'account', label: 'Pengaturan Akun', icon: UserIcon, badge: 'Profil', tourId: undefined },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={item.tourId}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-all font-display font-bold text-sm ${
                    active
                      ? 'doodle-nav-active text-ink -translate-y-0.5'
                      : 'rounded-2xl text-ink-muted hover:bg-paper-card/60 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-4 h-4 stroke-[2.4]"
                      style={{ filter: 'url(#wobble-sketch)' }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`wobbly-box text-[11px] font-hand px-2.5 py-0.5 ${
                      active ? 'bg-highlight text-ink' : 'bg-paper-warm'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & API Status Card */}
        <div className="space-y-3 pt-6 border-t-2 border-dashed border-ink/20">
          <div
            onClick={() => setActiveTab('account')}
            className={`cursor-pointer p-3.5 doodle-card flex items-center justify-between gap-2 transition-colors ${
              activeTab === 'account' ? 'bg-highlight-soft' : 'bg-paper-card hover:bg-paper-warm'
            }`}
          >
            <div className="min-w-0">
              <p className="font-display font-bold text-sm truncate">{user.name}</p>
              <p className="text-xs text-ink-muted truncate">{user.email}</p>
            </div>
            <span className="px-2.5 py-1.5 rounded-xl bg-paper-warm border-2 border-ink text-xs font-display font-bold shrink-0 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Akun</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-hand text-ink-muted px-1">
            <span>Laravel API + Gemini OCR:</span>
            <span className="inline-flex items-center gap-1 font-bold text-ink">
              <span
                className={`w-2 h-2 rounded-full border border-ink ${
                  isBackendConnected ? 'bg-mint-dark' : 'bg-highlight'
                }`}
              />
              {isBackendConnected ? 'Terhubung' : 'Mode Lokal Siap'}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        {/* MOBILE TOP BAR */}
        <header className="flex md:hidden items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="doodle-item w-10 h-10 bg-highlight flex items-center justify-center">
              <DoodleIcon name="paw" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-none">diCatat.</h1>
              <p className="text-xs font-hand text-ink-muted">Halo, {user.name}!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="tour-ai-scan-mobile"
              onClick={() => openQuickAdd('scan')}
              className="doodle-btn bg-sky-soft px-3 py-1.5 text-xs font-display font-bold flex items-center gap-1.5"
            >
              <DoodleIcon name="camera" className="w-4 h-4" />
              <span>Scan Struk AI</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`doodle-item w-9 h-9 flex items-center justify-center transition-colors ${
                activeTab === 'account' ? 'bg-highlight' : 'bg-paper-card hover:bg-highlight-soft'
              }`}
              title="Halaman Akun & Profil"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TAB 1: HOME & RECENT TRANSACTIONS */}
        {activeTab === 'home' && (
          <div className="space-y-6 pt-6">
            {/* Total Balance & Monthly Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Main Balance Notebook Card with Peeking Si Oren Gripping the Top Edge */}
              <div
                id="tour-balance-card"
                className="lg:col-span-7 p-5 sm:p-6 doodle-card bg-highlight-soft flex flex-col justify-between relative"
              >
                {/* Peeking Si Oren Mascot Perched on the Top-Right Border Edge */}
                <div className="absolute -top-11 right-4 sm:right-6 z-20">
                  <PeekingMascotOren
                    mood={mascotState.mood}
                    message={mascotState.message}
                  />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-card border-2 border-ink text-xs font-hand font-bold mb-2">
                    <DoodleIcon name="notebook" className="w-4 h-4" />
                    <span>Total Saldo Semua Dompet</span>
                  </span>
                  <div className="my-1">
                    <RoughNotation
                      type="highlight"
                      show={true}
                      color="#FFE066"
                      animationDuration={900}
                    >
                      <span className="font-display font-bold text-3xl sm:text-4xl text-ink px-1">
                        Rp {totalBalance.toLocaleString('id-ID')}
                      </span>
                    </RoughNotation>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t-2 border-dashed border-ink/25">
                  <div className="p-3 rounded-2xl bg-mint-soft border-2 border-ink shadow-doodle-sm">
                    <div className="flex items-center gap-1.5 text-xs font-hand text-ink-muted">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-ink" />
                      <span>Pemasukan Bulan Ini</span>
                    </div>
                    <p className="font-display font-bold text-sm sm:text-base text-ink mt-0.5">
                      +Rp {totalMonthlyIncome.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-coral-soft border-2 border-ink shadow-doodle-sm">
                    <div className="flex items-center gap-1.5 text-xs font-hand text-ink-muted">
                      <ArrowUpRight className="w-3.5 h-3.5 text-ink" />
                      <span>Pengeluaran Bulan Ini</span>
                    </div>
                    <p className="font-display font-bold text-sm sm:text-base text-ink mt-0.5">
                      -Rp {totalMonthlyExpense.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-Wallet Horizontal / Vertical Cards */}
              <div className="lg:col-span-5 p-5 doodle-card bg-paper-card flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-base flex items-center gap-1.5">
                    <DoodleIcon name="wallet" className="w-5 h-5" />
                    <span>Dompetku ({wallets.length})</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('wallets')}
                    className="text-xs font-display font-bold underline hover:text-oren-dark"
                  >
                    + Kelola / Transfer
                  </button>
                </div>

                <div className="space-y-2.5">
                  {wallets.map((w) => (
                    <div
                      key={w.id}
                      onClick={() =>
                        setSelectedWalletFilter(
                          selectedWalletFilter === w.id ? 'all' : w.id
                        )
                      }
                      className={`cursor-pointer flex items-center justify-between p-3 rounded-2xl border-2 border-ink transition-all ${
                        selectedWalletFilter === w.id
                          ? 'bg-highlight shadow-doodle-sm -translate-y-0.5'
                          : 'bg-paper hover:bg-paper-warm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-9 h-9 rounded-xl border-2 border-ink flex items-center justify-center shadow-doodle-sm"
                          style={{ backgroundColor: w.color }}
                        >
                          <DoodleIcon name={w.icon} className="w-6 h-6" />
                        </span>
                        <div>
                          <p className="font-display font-bold text-xs sm:text-sm">{w.name}</p>
                          <span className="text-[11px] font-hand uppercase text-ink-muted">
                            {w.type === 'cash'
                              ? 'Uang Tunai'
                              : w.type === 'bank'
                              ? 'Rekening Bank'
                              : 'E-Wallet'}
                          </span>
                        </div>
                      </div>
                      <span className="font-display font-bold text-xs sm:text-sm">
                        Rp {w.balance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Budget Health Bar */}
            <div className="p-4 sm:p-5 doodle-card bg-paper-card">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <DoodleIcon name="target" className="w-5 h-5" />
                  <h3 className="font-display font-bold text-sm sm:text-base">
                    Progress Anggaran Bulanan
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('budget')}
                  className="text-xs font-hand font-bold px-2.5 py-1 rounded-full bg-paper-warm border border-ink hover:bg-highlight"
                >
                  Atur Limit Budget →
                </button>
              </div>
              <RoughProgressBar
                percent={budgetUsagePercent}
                color={
                  budgetUsagePercent >= 100
                    ? '#FF8B94'
                    : budgetUsagePercent >= 75
                    ? '#FFE066'
                    : '#A8E6CF'
                }
                height={22}
              />
              <div className="flex items-center justify-between text-xs font-hand text-ink-muted mt-1.5">
                <span>
                  Terpakai: <strong className="text-ink">Rp {totalMonthlyExpense.toLocaleString('id-ID')}</strong> ({budgetUsagePercent}%)
                </span>
                <span>
                  Batas: <strong className="text-ink">Rp {overallBudget.toLocaleString('id-ID')}</strong>
                </span>
              </div>
            </div>

            {/* CLEAN RECENT TRANSACTIONS (5 ITEMS ONLY ON HOME) */}
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <DoodleIcon name="pencil" className="w-5 h-5" />
                    <span>Transaksi Terbaru</span>
                  </h2>
                  <p className="text-xs font-hand text-ink-muted">
                    5 catatan pengeluaran & pemasukan terakhir
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-hand font-bold px-3 py-1 rounded-full bg-paper-warm border border-ink hover:bg-highlight"
                >
                  Lihat Semua ({transactions.length}) →
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="py-8">
                  <MascotOren
                    mood="sleeping"
                    size="md"
                    message="Meong~ Buku jurnalmu masih kosong. Yuk catat transaksi pertamamu!"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {transactions.slice(0, 5).map((tx) => {
                    const cat = categories.find((c) => c.id === tx.category_id);
                    const wallet = wallets.find((w) => w.id === tx.wallet_id);
                    const toWallet = wallets.find((w) => w.id === tx.to_wallet_id);

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="cursor-pointer flex items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-paper border-2 border-ink shadow-doodle-sm hover:bg-paper-warm transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-11 h-11 rounded-2xl border-2 border-ink flex items-center justify-center shrink-0 shadow-doodle-sm"
                            style={{
                              backgroundColor:
                                tx.type === 'transfer'
                                  ? '#A0C4FF'
                                  : cat?.color || '#FFE066',
                            }}
                          >
                            <DoodleIcon
                              name={tx.type === 'transfer' ? 'transfer' : cat?.icon || 'sparkle'}
                              className="w-6 h-6"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-display font-bold text-xs sm:text-sm text-ink truncate">
                              {tx.note}
                            </p>
                            <p className="text-[11px] font-hand text-ink-muted truncate mt-0.5">
                              {tx.type === 'transfer'
                                ? `${wallet?.name} → ${toWallet?.name}`
                                : `${cat?.name || 'Umum'} • ${wallet?.name}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-hand text-ink-muted">
                                {tx.transaction_date}
                              </span>
                              {tx.is_ai_scanned && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-highlight border border-ink text-[9px] font-display font-bold">
                                  <Sparkles className="w-2.5 h-2.5" /> AI
                                </span>
                              )}
                              {tx.receipt_image_url && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-sky-soft border border-ink text-[9px] font-display font-bold">
                                  <DoodleIcon name="camera" className="w-3 h-3" />
                                  <span>Struk</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-display font-bold text-xs sm:text-sm px-2.5 py-1 rounded-xl border border-ink whitespace-nowrap ${
                              tx.type === 'income'
                                ? 'bg-mint-soft text-ink'
                                : tx.type === 'transfer'
                                ? 'bg-sky-soft text-ink'
                                : 'bg-coral-soft text-ink'
                            }`}
                          >
                            {tx.type === 'income'
                              ? `+Rp${tx.amount.toLocaleString('id-ID')}`
                              : tx.type === 'transfer'
                              ? `Rp${tx.amount.toLocaleString('id-ID')}`
                              : `-Rp${tx.amount.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      className="w-full py-2.5 doodle-item bg-paper-warm hover:bg-highlight-soft font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-1.5"
                    >
                      <span>Cari & Lihat Semua Transaksi ({transactions.length}) →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEDICATED PAGE: SEMUA TRANSAKSI (SEARCH, FILTER BY TYPE/WALLET/CATEGORY & FULL HISTORY) */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              {/* Top Header with Back to Home Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="doodle-item w-9 h-9 bg-paper-warm hover:bg-highlight-soft flex items-center justify-center shrink-0"
                    title="Kembali ke Beranda"
                  >
                    <ArrowLeft className="w-4 h-4 text-ink" />
                  </button>
                  <div>
                    <h2 className="font-display font-bold text-lg flex items-center gap-2">
                      <DoodleIcon name="notebook" className="w-5 h-5" />
                      <span>Riwayat Semua Transaksi ({filteredTransactions.length})</span>
                    </h2>
                    <p className="text-xs font-hand text-ink-muted">
                      Cari catatan, saring per dompet, kategori, atau jenis transaksi
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openQuickAdd('manual')}
                  className="doodle-btn bg-highlight px-3.5 py-2 text-xs font-display font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Catat Baru</span>
                </button>
              </div>

              {/* Search & Wallet Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 doodle-field flex items-center px-3.5">
                  <Search className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kopi, makan, listrik, gaji..."
                    className="w-full py-2.5 text-xs sm:text-sm doodle-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-ink-muted hover:text-ink ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-5">
                  <HandDrawnSelect
                    value={selectedWalletFilter}
                    onChange={(val) =>
                      setSelectedWalletFilter(val === 'all' ? 'all' : Number(val))
                    }
                    options={[
                      { value: 'all', label: 'Semua Dompet', icon: 'wallet', color: '#FFF3B0' },
                      ...wallets.map((w) => ({
                        value: w.id,
                        label: w.name,
                        icon: w.icon,
                        color: w.color,
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* Transaction Type Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Semua Jenis', bg: 'bg-highlight' },
                  { id: 'expense', label: 'Pengeluaran', icon: 'expense', bg: 'bg-coral-soft' },
                  { id: 'income', label: 'Pemasukan', icon: 'income', bg: 'bg-mint-soft' },
                  { id: 'transfer', label: 'Transfer', icon: 'transfer', bg: 'bg-sky-soft' },
                ].map((tab) => {
                  const isActive = selectedTypeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setSelectedTypeFilter(
                          tab.id as 'all' | 'expense' | 'income' | 'transfer'
                        )
                      }
                      className={`px-3 py-1.5 rounded-full border-2 border-ink text-xs font-display font-bold flex items-center gap-1.5 transition-all ${
                        isActive ? `${tab.bg} -translate-y-0.5` : 'bg-paper text-ink-muted'
                      }`}
                    >
                      {tab.icon && <DoodleIcon name={tab.icon} className="w-4 h-4" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full border-2 border-ink text-xs font-display font-bold shrink-0 ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-highlight shadow-doodle-sm'
                      : 'bg-paper'
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryFilter(
                        selectedCategoryFilter === cat.id ? 'all' : cat.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border-2 border-ink text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-highlight shadow-doodle-sm font-bold'
                        : 'bg-paper hover:bg-paper-warm'
                    }`}
                  >
                    <DoodleIcon name={cat.icon} className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Full Filtered Transactions List */}
              {filteredTransactions.length === 0 ? (
                <div className="py-8">
                  <MascotOren
                    mood="sleeping"
                    size="md"
                    message="Meong~ Tidak ada transaksi yang cocok dengan pencarian/filter ini."
                  />
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {filteredTransactions.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.category_id);
                    const wallet = wallets.find((w) => w.id === tx.wallet_id);
                    const toWallet = wallets.find((w) => w.id === tx.to_wallet_id);

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="cursor-pointer flex items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-paper border-2 border-ink shadow-doodle-sm hover:bg-paper-warm transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-11 h-11 rounded-2xl border-2 border-ink flex items-center justify-center shrink-0 shadow-doodle-sm"
                            style={{
                              backgroundColor:
                                tx.type === 'transfer'
                                  ? '#A0C4FF'
                                  : cat?.color || '#FFE066',
                            }}
                          >
                            <DoodleIcon
                              name={tx.type === 'transfer' ? 'transfer' : cat?.icon || 'sparkle'}
                              className="w-6 h-6"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-display font-bold text-xs sm:text-sm text-ink truncate">
                              {tx.note}
                            </p>
                            <p className="text-[11px] font-hand text-ink-muted truncate mt-0.5">
                              {tx.type === 'transfer'
                                ? `${wallet?.name} → ${toWallet?.name}`
                                : `${cat?.name || 'Umum'} • ${wallet?.name}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-hand text-ink-muted">
                                {tx.transaction_date}
                              </span>
                              {tx.is_ai_scanned && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-highlight border border-ink text-[9px] font-display font-bold">
                                  <Sparkles className="w-2.5 h-2.5" /> AI
                                </span>
                              )}
                              {tx.receipt_image_url && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-sky-soft border border-ink text-[9px] font-display font-bold">
                                  <DoodleIcon name="camera" className="w-3 h-3" />
                                  <span>Struk</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-display font-bold text-xs sm:text-sm px-2.5 py-1 rounded-xl border border-ink whitespace-nowrap ${
                              tx.type === 'income'
                                ? 'bg-mint-soft text-ink'
                                : tx.type === 'transfer'
                                ? 'bg-sky-soft text-ink'
                                : 'bg-coral-soft text-ink'
                            }`}
                          >
                            {tx.type === 'income'
                              ? `+Rp${tx.amount.toLocaleString('id-ID')}`
                              : tx.type === 'transfer'
                              ? `Rp${tx.amount.toLocaleString('id-ID')}`
                              : `-Rp${tx.amount.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STATISTICS, SMART INSIGHTS, HAND-DRAWN DONUT CHART & MINI DAILY CALENDAR */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Smart Insights Card */}
            <div className="p-5 sm:p-6 doodle-card bg-mint-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <DoodleIcon name="bulb" className="w-6 h-6" />
                  <span>Insight & Ringkasan Pintar Si Oren</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-paper-card border-2 border-ink shadow-doodle-sm">
                  <span className="text-xs font-hand text-ink-muted inline-flex items-center gap-1.5">
                    <DoodleIcon name="fire" className="w-4 h-4" />
                    <span>Kategori Paling Boros</span>
                  </span>
                  <div className="font-display font-bold text-base mt-1 flex items-center gap-2">
                    <DoodleIcon
                      name={
                        [...expenseChartData].sort((a, b) => b.value - a.value)[0]?.icon ||
                        'food'
                      }
                      className="w-5 h-5"
                    />
                    <span>
                      {[...expenseChartData].sort((a, b) => b.value - a.value)[0]?.label ||
                        'Makan & Kopi'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    Total Rp{' '}
                    {(
                      [...expenseChartData].sort((a, b) => b.value - a.value)[0]?.value || 0
                    ).toLocaleString('id-ID')}{' '}
                    bulan ini.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-paper-card border-2 border-ink shadow-doodle-sm">
                  <span className="text-xs font-hand text-ink-muted inline-flex items-center gap-1.5">
                    <DoodleIcon name="chart" className="w-4 h-4" />
                    <span>Rata-Rata Keluar Harian</span>
                  </span>
                  <p className="font-display font-bold text-base mt-1">
                    Rp{' '}
                    {Math.round(
                      totalMonthlyExpense / Math.max(1, new Date().getDate())
                    ).toLocaleString('id-ID')}{' '}
                    / hari
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Tetap di bawah Rp100.000/hari supaya target budget aman!
                  </p>
                </div>
              </div>
            </div>

            {/* Hand-Drawn Rough.js Donut / Pie Chart */}
            <div className="p-5 sm:p-6 doodle-card bg-paper-card">
              <div className="mb-4">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <DoodleIcon name="chart" className="w-6 h-6" />
                  <span>Porsi Pengeluaran per Kategori (Hand-Drawn Chart)</span>
                </h2>
                <p className="text-xs font-hand text-ink-muted">
                  Digambar langsung dengan arsiran krayon menggunakan Rough.js
                </p>
              </div>
              <RoughDonutChart data={expenseChartData} size={230} />
            </div>

            {/* Mini Daily Transaction Calendar */}
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>Kalender Transaksi Harian ({activeMonth})</span>
                  </h2>
                  <p className="text-xs font-hand text-ink-muted">
                    Klik tanggal untuk melihat detail pengeluaran di hari tersebut
                  </p>
                </div>
                <span className="text-xs font-display font-bold px-3 py-1 rounded-full bg-highlight border-2 border-ink">
                  Tanggal dipilih: {selectedCalendarDate}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-hand font-bold text-ink-muted py-1"
                  >
                    {d}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const isSelected = day.dateStr === selectedCalendarDate;
                  const hasTx = day.count > 0;
                  const compactExpenseLabel =
                    day.expenseSum >= 1_000_000
                      ? `${(day.expenseSum / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`
                      : `${Math.round(day.expenseSum / 1000)}k`;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedCalendarDate(day.dateStr)}
                      className={`px-0.5 py-1.5 sm:p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[54px] sm:min-h-[60px] ${
                        isSelected
                          ? 'bg-highlight border-ink shadow-doodle-sm -translate-y-0.5 font-bold'
                          : hasTx
                          ? 'bg-paper-warm border-ink/80 hover:bg-highlight-soft'
                          : 'bg-paper border-ink/25 text-ink-muted hover:border-ink'
                      }`}
                    >
                      <span className="font-display text-xs sm:text-sm leading-tight">
                        {day.dayNum}
                      </span>
                      {day.expenseSum > 0 ? (
                        <span className="text-[9px] sm:text-[10px] font-display font-bold leading-none px-1 py-0.5 rounded-md bg-coral-soft text-ink mt-1 whitespace-nowrap">
                          {compactExpenseLabel}
                        </span>
                      ) : hasTx ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-mint-dark border border-ink mt-1" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Transactions on Selected Date */}
              <div className="pt-3 border-t-2 border-dashed border-ink/20">
                <h4 className="font-display font-bold text-sm mb-2">
                  Catatan Tanggal {selectedCalendarDate} ({selectedDateTransactions.length} transaksi)
                </h4>
                {selectedDateTransactions.length === 0 ? (
                  <p className="text-xs font-hand text-ink-muted py-2">
                    Tidak ada transaksi tercatat di tanggal ini. Hari bebas jajan! 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateTransactions.map((tx) => {
                      const cat = categories.find((c) => c.id === tx.category_id);
                      return (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTransaction(tx)}
                          className="cursor-pointer flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-paper border-2 border-ink text-xs sm:text-sm hover:bg-paper-warm transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <DoodleIcon name={cat?.icon || 'sparkle'} className="w-5 h-5" />
                            <span className="font-semibold leading-snug truncate">{tx.note}</span>
                          </div>
                          <span className="font-display font-bold whitespace-nowrap shrink-0">
                            {tx.type === 'income' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MONTHLY BUDGETING PER CATEGORY */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <DoodleIcon name="target" className="w-6 h-6" />
                    <span>Atur Anggaran Bulanan ({activeMonth})</span>
                  </h2>
                  <p className="text-xs font-hand text-ink-muted">
                    Ekspresi Si Oren akan otomatis berubah mengikuti persentase pemakaian budgetmu!
                  </p>
                </div>
              </div>

              {/* Overall Monthly Budget Summary Card with Edit Modal Trigger */}
              <div className="p-4 rounded-2xl bg-highlight-soft border-2 border-ink shadow-doodle-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-hand uppercase text-ink-muted block">
                      Total Batas Anggaran Bulanan
                    </span>
                    <p className="font-display font-bold text-xl sm:text-2xl text-ink">
                      Rp {overallBudget.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBudgetCategoryId(null);
                      setBudgetAmountInput(String(overallBudget));
                      setIsBudgetModalOpen(true);
                    }}
                    className="doodle-btn bg-paper-card px-3.5 py-2 text-xs font-display font-bold flex items-center gap-1.5 shrink-0 hover:bg-highlight"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Ubah Limit</span>
                  </button>
                </div>

                <RoughProgressBar
                  percent={budgetUsagePercent}
                  color={
                    budgetUsagePercent >= 100
                      ? '#FF8B94'
                      : budgetUsagePercent >= 75
                      ? '#FFE066'
                      : '#A8E6CF'
                  }
                  height={20}
                />

                <div className="flex items-center justify-between text-xs font-hand text-ink-muted">
                  <span>
                    Terpakai:{' '}
                    <strong className="text-ink">
                      Rp {totalMonthlyExpense.toLocaleString('id-ID')}
                    </strong>{' '}
                    ({budgetUsagePercent}%)
                  </span>
                  <span>
                    Sisa:{' '}
                    <strong className="text-ink">
                      Rp {Math.max(0, overallBudget - totalMonthlyExpense).toLocaleString('id-ID')}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Per-Category Budget List (Clean Progress Cards + Edit Modal Button) */}
              <div className="space-y-3 pt-1">
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((cat) => {
                    const catLimit =
                      budgets.find(
                        (b) => b.category_id === cat.id && b.month_year === activeMonth
                      )?.amount_limit || 500000;
                    const catSpent = monthTransactions
                      .filter((t) => t.type === 'expense' && t.category_id === cat.id)
                      .reduce((acc, t) => acc + t.amount, 0);
                    const pct = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0;

                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-2xl bg-paper border-2 border-ink shadow-doodle-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-9 h-9 rounded-xl border-2 border-ink flex items-center justify-center shrink-0"
                              style={{ backgroundColor: cat.color }}
                            >
                              <DoodleIcon name={cat.icon} className="w-5 h-5" />
                            </span>
                            <h4 className="font-display font-bold text-sm sm:text-base text-ink truncate">
                              {cat.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className="px-2.5 py-0.5 rounded-full border border-ink text-xs font-display font-bold text-ink"
                              style={{ backgroundColor: cat.color }}
                            >
                              {pct}%
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBudgetCategoryId(cat.id);
                                setBudgetAmountInput(String(catLimit));
                                setIsBudgetModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-highlight-soft"
                              title={`Ubah limit budget ${cat.name}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <RoughProgressBar
                          percent={pct}
                          color={cat.color}
                          height={18}
                        />

                        <div className="flex items-center justify-between gap-2 text-xs font-hand text-ink-muted">
                          <span>
                            Terpakai:{' '}
                            <strong className="text-ink">
                              Rp {catSpent.toLocaleString('id-ID')}
                            </strong>
                          </span>
                          <span>
                            Batas:{' '}
                            <strong className="text-ink">
                              Rp {catLimit.toLocaleString('id-ID')}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-WALLET & CUSTOM CATEGORIES */}
        {activeTab === 'wallets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallets Manager */}
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <DoodleIcon name="wallet" className="w-6 h-6" />
                    <span>Daftar Dompet (Multi-Wallet)</span>
                  </h2>
                  <p className="text-xs font-hand text-ink-muted">
                    Pisahkan uang tunai, rekening bank, dan e-wallet
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openQuickAdd('manual')}
                    className="doodle-item bg-sky-soft px-3 py-1.5 text-xs font-display font-bold flex items-center gap-1 hover:bg-sky/50"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWalletId(null);
                      setNewWalletName('');
                      setNewWalletBalance('');
                      setNewWalletType('ewallet');
                      setIsWalletModalOpen(true);
                    }}
                    className="doodle-btn bg-highlight px-3 py-1.5 text-xs font-display font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Dompet Baru</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {wallets.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border-2 border-ink bg-paper shadow-doodle-sm transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center shrink-0"
                        style={{ backgroundColor: w.color }}
                      >
                        <DoodleIcon name={w.icon} className="w-6 h-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm truncate">{w.name}</p>
                        <span className="text-xs font-hand text-ink-muted uppercase">
                          {w.type === 'cash'
                            ? 'Uang Tunai'
                            : w.type === 'bank'
                            ? 'Rekening Bank'
                            : 'E-Wallet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-display font-bold text-xs sm:text-sm whitespace-nowrap mr-1">
                        Rp {w.balance.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWalletId(w.id);
                          setNewWalletName(w.name);
                          setNewWalletBalance(String(w.balance));
                          setNewWalletType(w.type);
                          setIsWalletModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-highlight-soft"
                        title="Edit dompet"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {wallets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteWallet(w.id)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-coral-dark hover:bg-coral-soft"
                          title="Hapus dompet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Categories Manager */}
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <FolderPlus className="w-5 h-5" />
                    <span>Kustomisasi Kategori & Ikon</span>
                  </h2>
                  <p className="text-xs font-hand text-ink-muted">
                    Tambah, ubah, atau hapus kategori pengeluaran & pemasukan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setNewCategoryName('');
                    setNewCategoryIcon('🧋');
                    setNewCategoryType('expense');
                    setIsCategoryModalOpen(true);
                  }}
                  className="doodle-btn bg-mint px-3 py-1.5 text-xs font-display font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Kategori Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border-2 border-ink bg-paper shadow-doodle-sm transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-8 h-8 rounded-lg border border-ink flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <DoodleIcon name={cat.icon} className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-xs truncate">{cat.name}</p>
                        <span className="text-[10px] font-hand text-ink-muted block">
                          {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setNewCategoryName(cat.name);
                          setNewCategoryIcon(cat.icon);
                          setNewCategoryType(cat.type);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-highlight-soft"
                        title="Edit kategori"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-ink-muted hover:text-coral-dark hover:bg-coral-soft"
                          title="Hapus kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED PAGE: PENGATURAN AKUN (NAMA, EMAIL, GANTI PASSWORD & LOGOUT) */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Top Profile Summary Card */}
            <div className="p-5 sm:p-6 doodle-card bg-highlight-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="doodle-item w-9 h-9 bg-paper-card hover:bg-paper-warm flex items-center justify-center shrink-0"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-4 h-4 text-ink" />
                </button>
                <div className="doodle-item-active w-14 h-14 bg-highlight flex items-center justify-center shrink-0">
                  <DoodleIcon name="paw" className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-xl text-ink truncate">
                      {user.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-mint-soft border border-ink text-[10px] font-display font-bold text-ink">
                      {user.isAuthenticated ? '✓ Akun Aktif' : 'Mode Tamu'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-muted truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-hand text-ink-muted sm:text-right">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('home');
                    startTutorial();
                  }}
                  className="doodle-btn bg-paper-card px-3.5 py-1.5 font-display font-bold text-xs text-ink flex items-center gap-1.5 hover:bg-highlight"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ulangi Tutorial Spotlight</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-paper-card border-2 border-ink font-display font-bold text-ink">
                  {wallets.length} Dompet • {transactions.length} Transaksi
                </span>
              </div>
            </div>

            {user.isAuthenticated ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: Edit Profile (Nama & Email) */}
                <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl border-2 border-ink bg-sky-soft flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-ink" />
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                        Profil Akun
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Perbarui nama panggilan dan alamat email akunmu
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!accountName.trim() || !accountEmail.trim()) return;
                      updateProfile(accountName.trim(), accountEmail.trim());
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-display font-bold mb-1">
                        Nama Lengkap / Panggilan
                      </label>
                      <div className="doodle-field">
                        <input
                          type="text"
                          required
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Nama kamu"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold mb-1">
                        Alamat Email
                      </label>
                      <div className="doodle-field">
                        <input
                          type="email"
                          required
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                          placeholder="email@dicatat.com"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Simpan Perubahan Profil</span>
                    </button>
                  </form>
                </div>

                {/* Card 2: Change Password */}
                <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl border-2 border-ink bg-mint-soft flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-ink" />
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                        Ganti Password
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Amankan buku jurnal keuanganmu dengan password baru
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPasswordError(null);
                      if (!currentPassword) {
                        setPasswordError('Masukkan password saat ini terlebih dahulu.');
                        return;
                      }
                      if (newPassword.length < 6) {
                        setPasswordError('Password baru minimal 6 karakter.');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordError('Konfirmasi password baru belum sama.');
                        return;
                      }
                      changePassword(currentPassword, newPassword);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-display font-bold mb-1">
                        Password Saat Ini
                      </label>
                      <div className="doodle-field">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 text-xs sm:text-sm doodle-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-display font-bold">
                            Password Baru
                          </label>
                          {newPassword.length > 0 && (
                            <span
                              className={`text-[10px] font-display font-bold ${
                                newPassword.length < 6 ? 'text-coral-dark' : 'text-ink'
                              }`}
                            >
                              {newPassword.length < 6
                                ? `Kurang ${6 - newPassword.length} karakter`
                                : '✓ Minimal 6 karakter'}
                            </span>
                          )}
                        </div>
                        <div
                          className={`doodle-field transition-colors ${
                            newPassword.length > 0 && newPassword.length < 6
                              ? 'bg-coral-soft/60'
                              : ''
                          }`}
                        >
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full px-3.5 py-2 text-xs sm:text-sm doodle-input"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-display font-bold">
                            Ulangi Password Baru
                          </label>
                          {confirmPassword.length > 0 && (
                            <span
                              className={`text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full border border-ink ${
                                newPassword === confirmPassword
                                  ? 'bg-mint-soft text-ink'
                                  : 'bg-coral-soft text-ink'
                              }`}
                            >
                              {newPassword === confirmPassword ? '✓ Cocok' : '✕ Tidak cocok'}
                            </span>
                          )}
                        </div>
                        <div
                          className={`doodle-field transition-colors ${
                            confirmPassword.length > 0
                              ? newPassword === confirmPassword
                                ? 'bg-mint-soft/50'
                                : 'bg-coral-soft/60'
                              : ''
                          }`}
                        >
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ketik ulang password"
                            className="w-full px-3.5 py-2 text-xs sm:text-sm doodle-input"
                          />
                        </div>
                      </div>
                    </div>

                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                      <div className="doodle-item bg-coral-soft/90 px-3 py-2 flex items-center gap-2 text-[11px] sm:text-xs font-display font-bold text-ink">
                        <DoodleIcon name="warning" className="w-5 h-5 shrink-0" />
                        <span>Konfirmasi password baru belum cocok dengan password baru yang kamu ketik.</span>
                      </div>
                    )}

                    {passwordError && (
                      <div className="doodle-item bg-coral-soft px-3 py-2 flex items-center gap-2 text-xs font-display font-bold text-ink">
                        <DoodleIcon name="warning" className="w-5 h-5 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 doodle-btn bg-mint font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Perbarui Password</span>
                    </button>
                  </form>
                </div>

                {/* Card 3: Logout Section */}
                <div className="lg:col-span-2 p-5 sm:p-6 doodle-card bg-coral-soft/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-ink" />
                        <span>Keluar dari Akun (Logout)</span>
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Data keuanganmu tetap tersimpan aman di database MySQL diCatat.
                      </p>
                    </div>

                    {!isConfirmingLogout ? (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingLogout(true)}
                        className="doodle-btn bg-coral px-5 py-2.5 font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-2 shrink-0"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout Sekarang</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsConfirmingLogout(false)}
                          className="px-4 py-2 doodle-item bg-paper-card font-display font-bold text-xs text-ink"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsConfirmingLogout(false);
                            logoutUser();
                          }}
                          className="px-4 py-2 doodle-btn bg-coral font-display font-bold text-xs text-ink flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Ya, Keluar Akun</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Logged Out State inside Account Page */
              <div className="p-6 doodle-card bg-paper-card max-w-md mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-display font-bold text-lg text-ink">
                    Masuk ke Akun diCatat
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Masuk kembali untuk mengakses dan menyinkronkan buku jurnal keuanganmu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loginDemo('Kak Cawren (Google)', 'cawren.google@gmail.com')
                  }
                  className="w-full py-3 doodle-btn bg-sky-soft font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Lanjutkan dengan Google OAuth</span>
                </button>

                <div className="text-center text-xs font-hand text-ink-muted">
                  — atau masuk dengan Email —
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loginDemo(accountName || 'Kak Cawren', accountEmail || 'cawren@dicatat.com');
                  }}
                  className="space-y-3"
                >
                  <div className="doodle-field">
                    <input
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      placeholder="Email kamu"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm doodle-input"
                    />
                  </div>
                  <div className="doodle-field">
                    <input
                      type="password"
                      defaultValue="password123"
                      placeholder="Password"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm doodle-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 doodle-btn bg-highlight font-display font-bold text-sm text-ink flex items-center justify-center gap-2"
                  >
                    <DoodleIcon name="paw" className="w-5 h-5" />
                    <span>Masuk ke diCatat</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DETAIL TRANSAKSI (CLICKABLE FROM ANY TRANSACTION ITEM) */}
      {selectedTransaction && (() => {
        const tx = selectedTransaction;
        const cat = categories.find((c) => c.id === tx.category_id);
        const wallet = wallets.find((w) => w.id === tx.wallet_id);
        const toWallet = wallets.find((w) => w.id === tx.to_wallet_id);

        const typeBadge =
          tx.type === 'income'
            ? { label: 'Pemasukan', bg: 'bg-mint-soft', accent: 'bg-mint', prefix: '+' }
            : tx.type === 'transfer'
            ? { label: 'Transfer Antar Dompet', bg: 'bg-sky-soft', accent: 'bg-sky', prefix: '' }
            : { label: 'Pengeluaran', bg: 'bg-coral-soft', accent: 'bg-coral', prefix: '-' };

        return (
          <div
            onClick={() => setSelectedTransaction(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-[2px] p-0 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="doodle-card w-full max-w-md bg-paper p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200"
            >
              <div className="w-12 h-1.5 bg-ink/25 rounded-full mx-auto mb-1 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        tx.type === 'transfer' ? '#A0C4FF' : cat?.color || '#FFE066',
                    }}
                  >
                    <DoodleIcon
                      name={tx.type === 'transfer' ? 'transfer' : cat?.icon || 'sparkle'}
                      className="w-6 h-6"
                    />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
                      Detail Transaksi
                    </h3>
                    <span className="text-xs text-ink-muted">
                      {typeBadge.label} • #{tx.id}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTransaction(null)}
                  className="doodle-item w-9 h-9 bg-paper-card flex items-center justify-center hover:bg-coral-soft"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Big Amount Box */}
              <div className={`p-4 doodle-item-active ${typeBadge.bg} text-center space-y-1`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                  Nominal {typeBadge.label}
                </span>
                <p className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  {typeBadge.prefix}Rp {tx.amount.toLocaleString('id-ID')}
                </p>
                {tx.is_ai_scanned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-highlight border border-ink text-[10px] font-display font-bold">
                    <Sparkles className="w-3 h-3" /> Dipindai via Scan Struk AI
                  </span>
                )}
              </div>

              {/* Complete Transaction Metadata */}
              <div className="p-4 doodle-item bg-paper-card space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-ink-muted block">
                    Catatan / Keterangan Lengkap
                  </span>
                  <p className="font-display font-bold text-sm sm:text-base text-ink mt-0.5 break-words">
                    {tx.note}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-ink/20">
                  <div>
                    <span className="text-[11px] font-semibold text-ink-muted block">
                      {tx.type === 'transfer' ? 'Alur Dompet' : 'Kategori'}
                    </span>
                    <div className="font-display font-bold text-ink mt-0.5 flex items-center gap-1.5">
                      <DoodleIcon
                        name={tx.type === 'transfer' ? 'transfer' : cat?.icon || 'sparkle'}
                        className="w-4 h-4"
                      />
                      <span>
                        {tx.type === 'transfer'
                          ? `${wallet?.name} → ${toWallet?.name}`
                          : cat?.name || 'Umum'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-ink-muted block">
                      Dompet Sumber
                    </span>
                    <div className="font-display font-bold text-ink mt-0.5 flex items-center gap-1.5">
                      <DoodleIcon name={wallet?.icon || 'wallet'} className="w-4 h-4" />
                      <span>{wallet?.name || 'Dompet'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-ink/20 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-ink-muted">
                    Tanggal Transaksi
                  </span>
                  <span className="font-display font-bold text-ink">
                    {tx.transaction_date}
                  </span>
                </div>
              </div>

              {/* Attached Receipt Photo Full Preview (if present) */}
              {tx.receipt_image_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-display font-bold text-ink flex items-center gap-1.5">
                    <DoodleIcon name="camera" className="w-4 h-4" />
                    <span>Lampiran Foto Struk</span>
                  </span>
                  <div className="p-2 doodle-item bg-paper-card">
                    <img
                      src={tx.receipt_image_url}
                      alt="Bukti Struk Transaksi"
                      className="w-full max-h-56 object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Action Buttons: Delete Confirmation Alert or Default Actions */}
              {isConfirmingDelete ? (
                <div className="p-4 doodle-item-active bg-coral-soft space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-xl border-2 border-ink bg-paper-card flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-ink" />
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-sm text-ink">
                        Yakin mau hapus catatan penting ini?
                      </h4>
                      <p className="text-xs text-ink-muted leading-snug mt-0.5">
                        Menghapus transaksi ini akan mengubah saldo dompet{' '}
                        <strong className="text-ink">{wallet?.name}</strong>, akurasi laporan
                        statistik, serta perhitungan anggaran bulananmu. Pastikan kamu
                        benar-benar ingin menghapusnya!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="py-2.5 doodle-item bg-paper-card font-display font-bold text-xs sm:text-sm text-ink"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteTransaction(tx.id);
                        setIsConfirmingDelete(false);
                        setSelectedTransaction(null);
                      }}
                      className="py-2.5 doodle-btn bg-coral font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus!</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="py-3 doodle-item bg-coral-soft hover:bg-coral font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTransaction(null)}
                    className="col-span-2 py-3 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink"
                  >
                    Tutup Detail
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 5-SECOND UNDO DELETE FLOATING BANNER */}
      {pendingDelete && (
        <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-[85] flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md doodle-card bg-paper-card p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl border-2 border-ink bg-coral-soft flex items-center justify-center shrink-0 font-display font-bold text-xs text-ink">
                {undoSecondsLeft}s
              </span>
              <div className="min-w-0">
                <p className="font-display font-bold text-xs sm:text-sm text-ink truncate">
                  Transaksi dihapus
                </p>
                <p className="text-[11px] text-ink-muted truncate">
                  {pendingDelete.tx.note} (Rp {pendingDelete.tx.amount.toLocaleString('id-ID')})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={undoDeleteTransaction}
                className="doodle-btn bg-highlight px-3.5 py-2 font-display font-bold text-xs text-ink flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.6]" />
                <span>Undo ({undoSecondsLeft}s)</span>
              </button>
              <button
                type="button"
                onClick={commitPendingDelete}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ATUR LIMIT BUDGET (TOTAL & PER KATEGORI) */}
      {isBudgetModalOpen && (() => {
        const targetCat =
          editingBudgetCategoryId !== null
            ? categories.find((c) => c.id === editingBudgetCategoryId)
            : null;
        const currentVal = Number(budgetAmountInput) || 0;
        const quickPresets =
          editingBudgetCategoryId === null
            ? [2000000, 3000000, 5000000, 7500000]
            : [250000, 500000, 750000, 1000000];
        const incrementStep = editingBudgetCategoryId === null ? 500000 : 100000;

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-[2px] p-0 sm:p-4">
            <div className="doodle-card w-full max-w-md bg-paper p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="w-12 h-1.5 bg-ink/25 rounded-full mx-auto mb-1 sm:hidden" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-10 h-10 rounded-xl border-2 border-ink flex items-center justify-center shrink-0"
                    style={{ backgroundColor: targetCat?.color || '#FFE066' }}
                  >
                    <DoodleIcon name={targetCat?.icon || 'target'} className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink leading-tight">
                      {targetCat
                        ? `Atur Budget ${targetCat.name}`
                        : 'Atur Total Budget Bulanan'}
                    </h3>
                    <span className="text-xs text-ink-muted">
                      Bulan {activeMonth}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="doodle-item w-9 h-9 bg-paper-card flex items-center justify-center hover:bg-coral-soft"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const nextLimit = Math.max(50000, Number(budgetAmountInput) || 0);
                  updateBudget(editingBudgetCategoryId, nextLimit);
                  setIsBudgetModalOpen(false);
                }}
                className="space-y-4"
              >
                <div className="p-3.5 doodle-item bg-highlight-soft text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                    Batas Anggaran Baru
                  </span>
                  <span className="font-display font-bold text-2xl sm:text-3xl text-ink">
                    Rp {currentVal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Ketik Nominal Budget (Rp)
                  </label>
                  <div className="doodle-field">
                    <input
                      type="number"
                      autoFocus
                      step={50000}
                      min={0}
                      value={budgetAmountInput}
                      onChange={(e) => setBudgetAmountInput(e.target.value)}
                      placeholder="Contoh: 1000000"
                      className="w-full px-3.5 py-2.5 text-sm font-display font-bold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-display font-bold mb-1.5">
                    Pilih Cepat:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {quickPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudgetAmountInput(String(preset))}
                        className={`px-3 py-1.5 text-xs font-display font-bold ${
                          currentVal === preset
                            ? 'doodle-item-active bg-highlight text-ink'
                            : 'doodle-item bg-paper-card text-ink'
                        }`}
                      >
                        {preset >= 1000000
                          ? `Rp${preset % 1000000 === 0 ? (preset / 1000000).toFixed(0) : (preset / 1000000).toFixed(1)} Jt`
                          : `Rp${preset / 1000}rb`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setBudgetAmountInput(String(currentVal + incrementStep))
                      }
                      className="px-3 py-1.5 doodle-item bg-mint-soft text-xs font-display font-bold text-ink hover:bg-mint"
                    >
                      +{incrementStep / 1000}rb
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="py-3 doodle-item bg-paper-card font-display font-bold text-xs sm:text-sm text-ink"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="col-span-2 py-3 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink"
                  >
                    Simpan Limit Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL TAMBAH / EDIT DOMPET */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-[2px] p-0 sm:p-4">
          <div className="doodle-card w-full max-w-md bg-paper p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-ink/25 rounded-full mx-auto mb-1 sm:hidden" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoodleIcon name="wallet" className="w-6 h-6" />
                <h3 className="font-display font-bold text-lg text-ink">
                  {editingWalletId !== null ? 'Edit Dompet' : 'Tambah Dompet Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="doodle-item w-9 h-9 bg-paper-card flex items-center justify-center hover:bg-coral-soft"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newWalletName.trim()) return;
                const walletColor =
                  newWalletType === 'bank'
                    ? '#A0C4FF'
                    : newWalletType === 'ewallet'
                    ? '#A8E6CF'
                    : '#FFE066';
                const walletIcon =
                  newWalletType === 'bank'
                    ? '🏦'
                    : newWalletType === 'ewallet'
                    ? '📱'
                    : '💵';

                if (editingWalletId !== null) {
                  updateWallet(editingWalletId, {
                    name: newWalletName.trim(),
                    type: newWalletType,
                    balance: Number(newWalletBalance) || 0,
                    color: walletColor,
                    icon: walletIcon,
                  });
                } else {
                  addWallet({
                    name: newWalletName.trim(),
                    type: newWalletType,
                    balance: Number(newWalletBalance) || 0,
                    color: walletColor,
                    icon: walletIcon,
                  });
                }
                setEditingWalletId(null);
                setNewWalletName('');
                setNewWalletBalance('');
                setIsWalletModalOpen(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Nama Dompet
                </label>
                <div className="doodle-field">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Contoh: SeaBank, OVO, Celengan..."
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm doodle-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Jenis Dompet
                </label>
                <HandDrawnSelect
                  value={newWalletType}
                  onChange={(val) =>
                    setNewWalletType(val as 'cash' | 'bank' | 'ewallet')
                  }
                  options={[
                    { value: 'ewallet', label: 'E-Wallet', icon: '📱', color: '#A8E6CF' },
                    { value: 'bank', label: 'Rekening Bank', icon: '🏦', color: '#A0C4FF' },
                    { value: 'cash', label: 'Uang Tunai', icon: '💵', color: '#FFE066' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Saldo Saat Ini (Rp)
                </label>
                <div className="doodle-field">
                  <input
                    type="number"
                    placeholder="Contoh: 500000"
                    value={newWalletBalance}
                    onChange={(e) => setNewWalletBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm doodle-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="py-3 doodle-item bg-paper-card font-display font-bold text-xs sm:text-sm text-ink"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="col-span-2 py-3 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink"
                >
                  {editingWalletId !== null ? 'Simpan Perubahan' : 'Simpan Dompet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT KATEGORI */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-[2px] p-0 sm:p-4">
          <div className="doodle-card w-full max-w-md bg-paper p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-ink/25 rounded-full mx-auto mb-1 sm:hidden" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoodleIcon name={newCategoryIcon} className="w-6 h-6" />
                <h3 className="font-display font-bold text-lg text-ink">
                  {editingCategoryId !== null ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="doodle-item w-9 h-9 bg-paper-card flex items-center justify-center hover:bg-coral-soft"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryName.trim()) return;
                if (editingCategoryId !== null) {
                  updateCategory(editingCategoryId, {
                    name: newCategoryName.trim(),
                    type: newCategoryType,
                    icon: newCategoryIcon,
                  });
                } else {
                  addCategory({
                    name: newCategoryName.trim(),
                    type: newCategoryType,
                    icon: newCategoryIcon,
                    color: newCategoryType === 'income' ? '#A8E6CF' : '#FFD8A8',
                  });
                }
                setEditingCategoryId(null);
                setNewCategoryName('');
                setIsCategoryModalOpen(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Nama Kategori
                </label>
                <div className="doodle-field">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Contoh: Makanan Kucing, Langganan..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm doodle-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Tipe Kategori
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewCategoryType('expense')}
                    className={`py-2.5 px-3 font-display font-bold text-xs flex items-center justify-center gap-1.5 ${
                      newCategoryType === 'expense'
                        ? 'doodle-item-active bg-coral-soft text-ink'
                        : 'doodle-item bg-paper-card text-ink-muted'
                    }`}
                  >
                    <DoodleIcon name="expense" className="w-4 h-4" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategoryType('income')}
                    className={`py-2.5 px-3 font-display font-bold text-xs flex items-center justify-center gap-1.5 ${
                      newCategoryType === 'income'
                        ? 'doodle-item-active bg-mint-soft text-ink'
                        : 'doodle-item bg-paper-card text-ink-muted'
                    }`}
                  >
                    <DoodleIcon name="income" className="w-4 h-4" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold mb-1.5">
                  Pilih Ikon Doodle
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    '🍜',
                    '🛵',
                    '🛒',
                    '⚡',
                    '🎮',
                    '💰',
                    '🎨',
                    '🧋',
                    '🐱',
                    '📚',
                    '🎬',
                    '💊',
                    '✈️',
                    '🎁',
                    '🏋️',
                  ].map((ic) => {
                    const isSelectedIcon = newCategoryIcon === ic;
                    return (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setNewCategoryIcon(ic)}
                        className={`h-11 flex items-center justify-center transition-all ${
                          isSelectedIcon
                            ? 'doodle-item-active bg-highlight -translate-y-0.5'
                            : 'doodle-item bg-paper-card hover:bg-paper-warm'
                        }`}
                      >
                        <DoodleIcon name={ic} className="w-6 h-6" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="py-3 doodle-item bg-paper-card font-display font-bold text-xs sm:text-sm text-ink"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="col-span-2 py-3 doodle-btn bg-mint font-display font-bold text-xs sm:text-sm text-ink"
                >
                  {editingCategoryId !== null ? 'Simpan Perubahan' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
      <nav className="doodle-bottom-nav md:hidden z-40 px-3 pt-2.5 pb-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 transition-all ${
            activeTab === 'home' ? 'doodle-nav-active font-bold text-ink' : 'text-ink-muted'
          }`}
        >
          <Home
            className="w-4 h-4 stroke-[2.4]"
            style={{ filter: 'url(#wobble-sketch)' }}
          />
          <span className="text-[11px] font-display">Beranda</span>
        </button>

        <button
          id="tour-stats-mobile"
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 transition-all ${
            activeTab === 'stats' ? 'doodle-nav-active font-bold text-ink' : 'text-ink-muted'
          }`}
        >
          <PieChart
            className="w-4 h-4 stroke-[2.4]"
            style={{ filter: 'url(#wobble-sketch)' }}
          />
          <span className="text-[11px] font-display">Statistik</span>
        </button>

        {/* CENTER FLOATING QUICK ADD (+) BUTTON */}
        <button
          id="tour-quick-add-mobile"
          onClick={() => openQuickAdd('manual')}
          className="doodle-fab -mt-7 w-14 h-14 flex items-center justify-center"
          aria-label="Catat Transaksi"
        >
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7"
            style={{ filter: 'url(#wobble-sketch)' }}
          >
            <path
              d="M16 6 C16.3 12, 15.7 20, 16 26 M6 16 C12 15.6, 20 16.4, 26 16"
              stroke="#2C2A29"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div id="tour-budget-wallets-mobile" className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all ${
              activeTab === 'budget' ? 'doodle-nav-active font-bold text-ink' : 'text-ink-muted'
            }`}
          >
            <Target
              className="w-4 h-4 stroke-[2.4]"
              style={{ filter: 'url(#wobble-sketch)' }}
            />
            <span className="text-[11px] font-display">Budget</span>
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all ${
              activeTab === 'wallets' ? 'doodle-nav-active font-bold text-ink' : 'text-ink-muted'
            }`}
          >
            <WalletIcon
              className="w-4 h-4 stroke-[2.4]"
              style={{ filter: 'url(#wobble-sketch)' }}
            />
            <span className="text-[11px] font-display">Dompet</span>
          </button>
        </div>
      </nav>

      {/* QUICK ADD & AI OCR MODAL */}
      <QuickAddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialMode={modalInitialMode}
      />

      {/* EMAIL & GOOGLE OAUTH LOGIN MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md doodle-card bg-paper p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">🔐 Akun diCatat & Sinkronisasi</h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="px-2.5 py-1 rounded-lg border-2 border-ink text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <MascotOren
              mood="happy"
              size="sm"
              message="Masuk dengan Google atau Email supaya catatan keuanganmu tersimpan aman di MySQL Laravel!"
            />

            <button
              type="button"
              onClick={() => {
                loginDemo('Kak Cawren (Google)', 'cawren.google@gmail.com');
                setShowAuthModal(false);
              }}
              className="w-full py-3 doodle-btn bg-paper-card font-display font-bold text-sm flex items-center justify-center gap-2.5"
            >
              <span>🌐 Lanjutkan dengan Google OAuth</span>
            </button>

            <div className="text-center text-xs font-hand text-ink-muted">
              — atau masuk dengan Email —
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginDemo('Kak Cawren', 'cawren@dicatat.com');
                setShowAuthModal(false);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                defaultValue={user.email}
                placeholder="Email kamu"
                className="w-full px-3.5 py-2.5 text-sm doodle-input"
              />
              <input
                type="password"
                defaultValue="password123"
                placeholder="Password"
                className="w-full px-3.5 py-2.5 text-sm doodle-input"
              />
              <button
                type="submit"
                className="w-full py-2.5 doodle-btn bg-highlight font-display font-bold text-sm"
              >
                🐾 Masuk ke diCatat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

