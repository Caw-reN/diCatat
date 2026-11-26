import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Link2,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { DoodleIcon } from './DoodleIcon';
import { HandDrawnSelect } from './HandDrawnSelect';

export interface AdminSettingsState {
  google_oauth_enabled: string;
  google_client_id: string;
  google_client_secret: string;
  google_redirect_uri: string;
  google_auth_url: string;

  ai_scanner_enabled: string;
  gemini_api_key: string;
  gemini_model: string;
  gemini_endpoint_url: string;
  gemini_custom_prompt: string;

  app_name: string;
  app_tagline: string;
  frontend_url: string;
  backend_api_url: string;
  default_monthly_budget: string;
  allow_registration: string;
}

interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_ai_scanned: number;
  total_wallets: number;
  total_categories: number;
  recent_users: {
    id: number;
    name: string;
    email: string;
    google_id?: string | null;
    created_at?: string;
  }[];
}

const currentBrowserOrigin =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

const DEFAULT_SETTINGS: AdminSettingsState = {
  google_oauth_enabled: '1',
  google_client_id: '',
  google_client_secret: '',
  google_redirect_uri: `${currentBrowserOrigin}/auth/google/callback`,
  google_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',

  ai_scanner_enabled: '1',
  gemini_api_key: '',
  gemini_model: 'gemini-2.5-flash',
  gemini_endpoint_url: 'https://generativelanguage.googleapis.com/v1beta/models',
  gemini_custom_prompt:
    'Analisis foto struk belanja ini secara akurat dan ekstrak merchant_name, amount, transaction_date, suggested_category, serta items_summary.',

  app_name: 'diCatat.',
  app_tagline: 'Buku Jurnal Keuangan Si Oren',
  frontend_url: currentBrowserOrigin,
  backend_api_url: `${currentBrowserOrigin}/api`,
  default_monthly_budget: '3000000',
  allow_registration: '1',
};

const STORAGE_KEY = 'dicatat_admin_settings_cache';
const ADMIN_AUTH_KEY = 'dicatat_admin_authenticated';

export const AdminDashboardPanel: React.FC = () => {
  const { apiBaseUrl, isBackendConnected, showToast, transactions, wallets, categories } =
    useFinanceStore();
  const usersCountFallback = 1;

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState('admin@dicatat.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    if (!adminEmail.trim() || !adminPassword) {
      setAdminAuthError('Email Admin dan Password wajib diisi.');
      return;
    }
    if (
      (adminEmail.trim().toLowerCase() === 'admin@dicatat.com' ||
        adminEmail.trim().toLowerCase() === 'cawren@dicatat.com') &&
      (adminPassword === 'admin123' || adminPassword === 'password')
    ) {
      localStorage.setItem(ADMIN_AUTH_KEY, '1');
      setIsAdminLoggedIn(true);
      setAdminPassword('');
    } else {
      setAdminAuthError('Kredensial Admin tidak cocok! Gunakan admin@dicatat.com / admin123');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdminLoggedIn(false);
  };

  const [settings, setSettings] = useState<AdminSettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<AdminStats>({
    total_users: usersCountFallback,
    total_transactions: transactions.length,
    total_ai_scanned: transactions.filter((t) => t.is_ai_scanned).length,
    total_wallets: wallets.length,
    total_categories: categories.length,
    recent_users: [],
  });

  const [activeSection, setActiveSection] = useState<'all' | 'oauth' | 'ai' | 'system'>('all');
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    ok: boolean;
    mode: string;
    message: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchSettingsFromBackend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/settings`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const merged = { ...DEFAULT_SETTINGS, ...data.settings };
          setSettings(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // Keep local cached settings if offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsFromBackend();
  }, []);

  const updateField = (key: keyof AdminSettingsState, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    try {
      const res = await fetch(`${apiBaseUrl}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        showToast({
          title: 'Konfigurasi Admin Disimpan!',
          subtitle: 'Link OAuth, API Key Gemini AI & Pengaturan Sistem berhasil diperbarui di MySQL',
          amountText: 'ADMIN PANEL',
          type: 'info',
          icon: 'sparkle',
        });
      } else {
        showToast({
          title: 'Tersimpan di Cache Lokal',
          subtitle: 'Konfigurasi Admin berhasil disimpan pada perangkat ini',
          type: 'info',
          icon: 'sparkle',
        });
      }
    } catch {
      showToast({
        title: 'Tersimpan di Cache Lokal',
        subtitle: 'Backend sedang offline, pengaturan disimpan ke penyimpanan lokal',
        type: 'info',
        icon: 'sparkle',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/settings/test-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          gemini_api_key: settings.gemini_api_key,
          gemini_model: settings.gemini_model,
          gemini_endpoint_url: settings.gemini_endpoint_url,
        }),
      });
      const data = await res.json();
      setAiTestResult({
        ok: Boolean(data.ok),
        mode: data.mode || 'info',
        message: data.message || 'Pengujian selesai.',
      });
    } catch {
      setAiTestResult({
        ok: false,
        mode: 'offline',
        message: 'Tidak dapat menghubungi server backend Laravel di ' + apiBaseUrl,
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  // Compute full Google OAuth preview URL
  const generatedOAuthUrl = `${settings.google_auth_url}?client_id=${encodeURIComponent(
    settings.google_client_id || 'YOUR_GOOGLE_CLIENT_ID'
  )}&redirect_uri=${encodeURIComponent(
    settings.google_redirect_uri
  )}&response_type=code&scope=${encodeURIComponent('openid email profile')}`;

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center doodle-btn w-14 h-14 bg-highlight">
              <ShieldCheck className="w-8 h-8 text-ink stroke-[2.4]" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                Portal Admin diCatat.
              </h1>
              <span className="wobbly-box px-2.5 py-0.5 bg-mint text-[11px] font-display font-bold text-ink">
                /admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted">
              Halaman khusus Administrator untuk mengelola Link OAuth, API Key AI, dan Konfigurasi Server
            </p>
          </div>

          <div className="doodle-card bg-paper-card p-6 sm:p-7 space-y-5">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Email Administrator
                </label>
                <div className="doodle-field flex items-center px-3.5">
                  <Mail className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@dicatat.com"
                    className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold mb-1">
                  Password Admin
                </label>
                <div className="doodle-field flex items-center px-3.5">
                  <Lock className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan password admin (admin123)"
                    className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                  />
                </div>
              </div>

              {adminAuthError && (
                <div className="doodle-item bg-coral-soft px-3 py-2 flex items-center gap-2 text-xs font-display font-bold text-ink">
                  <DoodleIcon name="warning" className="w-5 h-5 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 doodle-btn bg-highlight font-display font-bold text-sm sm:text-base text-ink flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Masuk ke Dashboard Admin</span>
              </button>
            </form>

            <div className="pt-3 border-t border-dashed border-ink/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(ADMIN_AUTH_KEY, '1');
                  setIsAdminLoggedIn(true);
                }}
                className="font-display font-bold text-ink-muted hover:text-ink underline"
              >
                ⚡ Pintasan Masuk Admin Demo (`admin@dicatat.com`)
              </button>
              <a
                href="/"
                className="font-display font-bold text-ink flex items-center gap-1 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ke Aplikasi User</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Standalone Admin Top Navbar */}
      <header className="border-b-2 border-ink bg-paper-warm px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="doodle-btn w-10 h-10 bg-highlight flex items-center justify-center">
              <DoodleIcon name="paw" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl text-ink leading-none">
                  diCatat.
                </span>
                <span className="wobbly-box px-2 py-0.5 bg-highlight text-[11px] font-display font-bold text-ink">
                  /admin
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Panel Kontrol Administrator Terpisah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="px-3.5 py-2 doodle-item bg-paper-card hover:bg-paper font-display font-bold text-xs text-ink flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Buka Aplikasi User (`/`)</span>
            </a>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="px-3.5 py-2 doodle-item bg-coral-soft hover:bg-coral font-display font-bold text-xs text-ink flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Admin</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Admin Header Banner */}
      <div className="p-5 sm:p-6 doodle-card bg-highlight-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 doodle-btn bg-highlight flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-ink stroke-[2.4]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
                Dashboard Admin & Integrasi API
              </h2>
              <span className="wobbly-box px-2.5 py-0.5 bg-mint text-[11px] font-display font-bold text-ink">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Pusat pengaturan Link Google OAuth, API Key Gemini Vision AI (Scan Struk), dan Endpoint Sistem diCatat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchSettingsFromBackend}
            disabled={isLoading}
            className="px-3.5 py-2.5 doodle-item bg-paper-card hover:bg-paper font-display font-bold text-xs text-ink flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2.5 doodle-btn bg-mint font-display font-bold text-xs sm:text-sm text-ink flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua'}</span>
          </button>
        </div>
      </div>

      {/* Quick System Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 doodle-item bg-paper-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-ink bg-sky-soft flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-ink" />
          </div>
          <div>
            <span className="text-[11px] font-display font-bold text-ink-muted uppercase">
              Total Pengguna
            </span>
            <p className="font-display font-bold text-lg sm:text-xl text-ink">
              {stats.total_users} Akun
            </p>
          </div>
        </div>

        <div className="p-4 doodle-item bg-paper-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-ink bg-highlight flex items-center justify-center shrink-0">
            <DoodleIcon name="camera" className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-display font-bold text-ink-muted uppercase">
              Status AI OCR
            </span>
            <p className="font-display font-bold text-sm sm:text-base text-ink">
              {settings.gemini_api_key.trim() ? '🟢 Live Gemini API' : '🟡 Mode Simulasi'}
            </p>
          </div>
        </div>

        <div className="p-4 doodle-item bg-paper-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-ink bg-mint-soft flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-ink" />
          </div>
          <div>
            <span className="text-[11px] font-display font-bold text-ink-muted uppercase">
              Google OAuth
            </span>
            <p className="font-display font-bold text-sm sm:text-base text-ink">
              {settings.google_oauth_enabled === '1' ? '🟢 Aktif' : '⚪ Nonaktif'}
            </p>
          </div>
        </div>

        <div className="p-4 doodle-item bg-paper-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-ink bg-lavender-soft flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-ink" />
          </div>
          <div>
            <span className="text-[11px] font-display font-bold text-ink-muted uppercase">
              Server Database
            </span>
            <p className="font-display font-bold text-sm sm:text-base text-ink">
              {isBackendConnected ? '🟢 MySQL Terhubung' : '🟠 Lokal / Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills for Admin Sections */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Semua Pengaturan', bg: 'bg-highlight' },
          { id: 'oauth', label: '1. Link & Kredensial Google OAuth', bg: 'bg-sky-soft' },
          { id: 'ai', label: '2. API AI & Scan Struk (Gemini)', bg: 'bg-mint-soft' },
          { id: 'system', label: '3. Endpoint Sistem & .ENV', bg: 'bg-lavender-soft' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as 'all' | 'oauth' | 'ai' | 'system')}
            className={`px-3.5 py-2 font-display font-bold text-xs transition-all ${
              activeSection === tab.id
                ? `doodle-item-active ${tab.bg} text-ink -translate-y-0.5`
                : 'doodle-item bg-paper-card text-ink-muted hover:bg-paper'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* SECTION 1: GOOGLE OAUTH CONFIGURATION */}
          {(activeSection === 'all' || activeSection === 'oauth') && (
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl border-2 border-ink bg-sky-soft flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-ink" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                      Konfigurasi Google OAuth 2.0
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Atur Client ID, Secret, dan Link Callback untuk login/daftar Google
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'google_oauth_enabled',
                      settings.google_oauth_enabled === '1' ? '0' : '1'
                    )
                  }
                  className={`px-3 py-1.5 doodle-item font-display font-bold text-xs transition-all ${
                    settings.google_oauth_enabled === '1'
                      ? 'bg-mint text-ink'
                      : 'bg-paper text-ink-muted'
                  }`}
                >
                  {settings.google_oauth_enabled === '1' ? '✓ OAuth Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Google Client ID
                  </label>
                  <div className="doodle-field flex items-center px-3.5">
                    <KeyRound className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type="text"
                      value={settings.google_client_id}
                      onChange={(e) => updateField('google_client_id', e.target.value)}
                      placeholder="Contoh: 8291048291-abcxyz.apps.googleusercontent.com"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Google Client Secret
                  </label>
                  <div className="doodle-field flex items-center px-3.5">
                    <KeyRound className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type={showGoogleSecret ? 'text' : 'password'}
                      value={settings.google_client_secret}
                      onChange={(e) => updateField('google_client_secret', e.target.value)}
                      placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxx"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleSecret((v) => !v)}
                      className="p-1.5 text-ink-muted hover:text-ink"
                      title="Tampilkan / Sembunyikan Secret"
                    >
                      {showGoogleSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-display font-bold">
                      Link Redirect URI (Callback OAuth)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy('redirect_uri', settings.google_redirect_uri)}
                      className="text-[11px] font-display font-bold text-ink-muted hover:text-ink flex items-center gap-1"
                    >
                      {copiedField === 'redirect_uri' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="doodle-field flex items-center px-3.5">
                    <Globe className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type="text"
                      value={settings.google_redirect_uri}
                      onChange={(e) => updateField('google_redirect_uri', e.target.value)}
                      placeholder="http://localhost:5173/auth/google/callback"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1">
                    Masukkan link ini ke bagian <strong>Authorized redirect URIs</strong> di Google Cloud Console.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Google OAuth Authorization Endpoint URL
                  </label>
                  <div className="doodle-field flex items-center px-3.5">
                    <Link2 className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type="text"
                      value={settings.google_auth_url}
                      onChange={(e) => updateField('google_auth_url', e.target.value)}
                      placeholder="https://accounts.google.com/o/oauth2/v2/auth"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                {/* Generated OAuth Authorization Link Preview */}
                <div className="p-3.5 doodle-item bg-sky-soft/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-display font-bold text-ink uppercase">
                      Preview Link Login OAuth Lengkap
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('full_oauth_url', generatedOAuthUrl)}
                      className="px-2 py-0.5 rounded-lg border border-ink bg-paper text-[11px] font-display font-bold flex items-center gap-1"
                    >
                      {copiedField === 'full_oauth_url' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono break-all text-ink-muted bg-paper/80 p-2 rounded-lg border border-ink/20">
                    {generatedOAuthUrl}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: AI API & OCR SCANNER (GOOGLE GEMINI VISION) */}
          {(activeSection === 'all' || activeSection === 'ai') && (
            <div className="p-5 sm:p-6 doodle-card bg-paper-card space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl border-2 border-ink bg-highlight flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-ink" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                      Konfigurasi API AI (Scan Struk OCR)
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Atur API Key Gemini Vision, pilihan model AI, dan instruksi prompt
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'ai_scanner_enabled',
                      settings.ai_scanner_enabled === '1' ? '0' : '1'
                    )
                  }
                  className={`px-3 py-1.5 doodle-item font-display font-bold text-xs transition-all ${
                    settings.ai_scanner_enabled === '1'
                      ? 'bg-mint text-ink'
                      : 'bg-paper text-ink-muted'
                  }`}
                >
                  {settings.ai_scanner_enabled === '1' ? '✓ AI Scan Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-display font-bold">
                      Google Gemini API Key
                    </label>
                    <span className="text-[11px] font-display font-bold text-ink-muted">
                      Google AI Studio (`AIzaSy...`)
                    </span>
                  </div>
                  <div className="doodle-field flex items-center px-3.5">
                    <KeyRound className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={settings.gemini_api_key}
                      onChange={(e) => updateField('gemini_api_key', e.target.value)}
                      placeholder="AIzaSyYourGeminiApiKeyHere..."
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey((v) => !v)}
                      className="p-1.5 text-ink-muted hover:text-ink"
                      title="Tampilkan / Sembunyikan API Key"
                    >
                      {showGeminiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Model AI Vision
                  </label>
                  <HandDrawnSelect
                    value={settings.gemini_model}
                    onChange={(val) => updateField('gemini_model', String(val))}
                    options={[
                      {
                        value: 'gemini-2.5-flash',
                        label: 'Gemini 2.5 Flash (Rekomendasi — Cepat & Akurat)',
                        icon: 'sparkle',
                        color: '#FFE066',
                      },
                      {
                        value: 'gemini-2.0-flash',
                        label: 'Gemini 2.0 Flash (Vision & Multimodal)',
                        icon: 'bulb',
                        color: '#A8E6CF',
                      },
                      {
                        value: 'gemini-1.5-pro',
                        label: 'Gemini 1.5 Pro (Analisis Struk Kompleks)',
                        icon: 'target',
                        color: '#A0C4FF',
                      },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Base Endpoint URL API AI
                  </label>
                  <div className="doodle-field flex items-center px-3.5">
                    <Globe className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type="text"
                      value={settings.gemini_endpoint_url}
                      onChange={(e) => updateField('gemini_endpoint_url', e.target.value)}
                      placeholder="https://generativelanguage.googleapis.com/v1beta/models"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Instruksi Tambahan Prompt AI (Si Oren OCR)
                  </label>
                  <div className="doodle-field p-2.5">
                    <textarea
                      rows={2}
                      value={settings.gemini_custom_prompt}
                      onChange={(e) => updateField('gemini_custom_prompt', e.target.value)}
                      placeholder="Instruksi tambahan saat mengekstrak item & nominal struk..."
                      className="w-full text-xs sm:text-sm font-semibold doodle-input resize-none"
                    />
                  </div>
                </div>

                {/* Test AI Connection Button & Feedback */}
                <div className="pt-1 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleTestAiConnection}
                    disabled={isTestingAi}
                    className="w-full py-2.5 px-4 doodle-item bg-highlight-soft hover:bg-highlight font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-2 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      {isTestingAi
                        ? 'Menguji Koneksi ke Server Gemini AI...'
                        : 'Tes Koneksi API AI Sekarang'}
                    </span>
                  </button>

                  {aiTestResult && (
                    <div
                      className={`p-3 doodle-item flex items-start gap-2.5 text-xs font-display font-bold text-ink ${
                        aiTestResult.ok ? 'bg-mint-soft' : 'bg-coral-soft'
                      }`}
                    >
                      <DoodleIcon
                        name={aiTestResult.ok ? 'sparkle' : 'warning'}
                        className="w-5 h-5 shrink-0 mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <p>{aiTestResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: SYSTEM ENDPOINTS, APP DEFAULTS & .ENV GENERATOR */}
          {(activeSection === 'all' || activeSection === 'system') && (
            <div className="lg:col-span-2 p-5 sm:p-6 doodle-card bg-paper-card space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl border-2 border-ink bg-lavender-soft flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-ink" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                    Pengaturan Endpoint Aplikasi, Budget Default & Generator .ENV
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Atur URL Frontend/Backend, batas budget awal pengguna baru, dan salin konfigurasi `.env` Laravel
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Nama Aplikasi
                  </label>
                  <div className="doodle-field px-3.5">
                    <input
                      type="text"
                      value={settings.app_name}
                      onChange={(e) => updateField('app_name', e.target.value)}
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    URL Frontend React
                  </label>
                  <div className="doodle-field px-3.5">
                    <input
                      type="text"
                      value={settings.frontend_url}
                      onChange={(e) => updateField('frontend_url', e.target.value)}
                      placeholder="http://localhost:5173"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    URL Backend API Laravel
                  </label>
                  <div className="doodle-field px-3.5">
                    <input
                      type="text"
                      value={settings.backend_api_url}
                      onChange={(e) => updateField('backend_api_url', e.target.value)}
                      placeholder="http://127.0.0.1:8000/api"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Budget Bulanan Default Akun Baru (Rp)
                  </label>
                  <div className="doodle-field px-3.5">
                    <input
                      type="number"
                      value={settings.default_monthly_budget}
                      onChange={(e) => updateField('default_monthly_budget', e.target.value)}
                      placeholder="3000000"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Tagline Aplikasi
                  </label>
                  <div className="doodle-field px-3.5">
                    <input
                      type="text"
                      value={settings.app_tagline}
                      onChange={(e) => updateField('app_tagline', e.target.value)}
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Pendaftaran Akun Baru
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'allow_registration',
                        settings.allow_registration === '1' ? '0' : '1'
                      )
                    }
                    className={`w-full py-2.5 px-3.5 doodle-item font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${
                      settings.allow_registration === '1'
                        ? 'bg-mint-soft text-ink'
                        : 'bg-coral-soft text-ink'
                    }`}
                  >
                    <span>
                      {settings.allow_registration === '1'
                        ? '🟢 Pendaftaran Dibuka'
                        : '🔴 Pendaftaran Ditutup'}
                    </span>
                  </button>
                </div>
              </div>

              {/* .ENV Snippet Generator */}
              <div className="p-4 doodle-item bg-paper-warm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-ink">
                    Snippet `.env` Laravel Otomatis (Siap Tempel)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'env_snippet',
                        `GOOGLE_CLIENT_ID="${settings.google_client_id}"\nGOOGLE_CLIENT_SECRET="${settings.google_client_secret}"\nGOOGLE_REDIRECT_URI="${settings.google_redirect_uri}"\nGEMINI_API_KEY="${settings.gemini_api_key}"\nGEMINI_MODEL="${settings.gemini_model}"`
                      )
                    }
                    className="px-3 py-1 doodle-item bg-highlight font-display font-bold text-xs text-ink flex items-center gap-1.5"
                  >
                    {copiedField === 'env_snippet' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Snippet .env Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Konfigurasi .env</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-paper p-3 rounded-xl border border-ink/25 overflow-x-auto text-ink">
{`GOOGLE_CLIENT_ID="${settings.google_client_id || 'your-google-client-id.apps.googleusercontent.com'}"
GOOGLE_CLIENT_SECRET="${settings.google_client_secret ? '••••••••••••••••' : 'your-google-client-secret'}"
GOOGLE_REDIRECT_URI="${settings.google_redirect_uri}"
GEMINI_API_KEY="${settings.gemini_api_key ? '••••••••••••••••' : 'your-gemini-api-key'}"
GEMINI_MODEL="${settings.gemini_model}"`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-7 py-3.5 doodle-btn bg-highlight font-display font-bold text-sm sm:text-base text-ink flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSaving
                ? 'Menyimpan Konfigurasi ke Server...'
                : 'Simpan Semua Konfigurasi Admin'}
            </span>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

