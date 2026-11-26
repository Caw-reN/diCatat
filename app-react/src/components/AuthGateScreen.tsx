import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Lock, Mail, Sparkles, UserPlus, X } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { DoodleIcon } from './DoodleIcon';

const MOCK_GOOGLE_ACCOUNTS = [
  {
    name: 'Kak Cawren',
    email: 'cawren.google@gmail.com',
    badge: 'Akun Google Utama',
    color: '#FFE066',
  },
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    badge: 'Akun Baru',
    color: '#A8E6CF',
  },
  {
    name: 'Dinda Putri',
    email: 'dinda.putri@gmail.com',
    badge: 'Akun Baru',
    color: '#A0C4FF',
  },
];

export const AuthGateScreen: React.FC = () => {
  const { apiBaseUrl, loginAccount, registerAccount, loginWithGoogle, exchangeGoogleCode } =
    useFinanceStore();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interactive Google Account Chooser Modal (when Real Client ID is not configured or for local testing)
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [useCustomGoogleAccount, setUseCustomGoogleAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Check if returning from real Google OAuth redirect with ?code=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    // Clean URL query params so refreshing doesn't re-exchange
    window.history.replaceState({}, document.title, '/');
    setIsLoading(true);
    let savedRedirectUri = `${window.location.origin}/auth/google/callback`;
    try {
      const cached = localStorage.getItem('dicatat_admin_settings_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const candidate = (parsed.google_redirect_uri || '').trim();
        const isCurrentDomainPublic =
          window.location.hostname !== 'localhost' &&
          window.location.hostname !== '127.0.0.1';
        const isCandidateLocal =
          candidate.includes('localhost') || candidate.includes('127.0.0.1');
        if (candidate && !(isCurrentDomainPublic && isCandidateLocal)) {
          savedRedirectUri = candidate;
        }
      }
    } catch {
      // ignore
    }
    exchangeGoogleCode(code, savedRedirectUri)
      .then((res) => {
        if (!res.ok) {
          setErrorMsg(res.error || 'Login Google OAuth gagal.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [exchangeGoogleCode]);

  const handleGoogleButtonClick = async () => {
    setErrorMsg(null);
    // Check if Admin configured a real Google Client ID in /admin
    const currentOriginCallback = `${window.location.origin}/auth/google/callback`;
    const isCurrentDomainPublic =
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    let clientId = '';
    let redirectUri = currentOriginCallback;
    let authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    try {
      const res = await fetch(`${apiBaseUrl}/admin/settings`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          localStorage.setItem('dicatat_admin_settings_cache', JSON.stringify(data.settings));
          clientId = (data.settings.google_client_id || '').trim();
          const candidateUri = (data.settings.google_redirect_uri || '').trim();
          const isCandidateLocal =
            candidateUri.includes('localhost') || candidateUri.includes('127.0.0.1');
          // Auto-use current public domain if database still has default localhost redirect URI
          redirectUri =
            candidateUri && !(isCurrentDomainPublic && isCandidateLocal)
              ? candidateUri
              : currentOriginCallback;
          authUrl = (data.settings.google_auth_url || authUrl).trim();
        }
      }
    } catch {
      // Fallback to localStorage cache if backend is unreachable
      try {
        const cached = localStorage.getItem('dicatat_admin_settings_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          clientId = (parsed.google_client_id || '').trim();
          const candidateUri = (parsed.google_redirect_uri || '').trim();
          const isCandidateLocal =
            candidateUri.includes('localhost') || candidateUri.includes('127.0.0.1');
          redirectUri =
            candidateUri && !(isCurrentDomainPublic && isCandidateLocal)
              ? candidateUri
              : currentOriginCallback;
          authUrl = (parsed.google_auth_url || authUrl).trim();
        }
      } catch {
        // ignore
      }
    }

    // If a real Google Client ID is configured in /admin, redirect to real Google Account Chooser!
    if (clientId && clientId.includes('.apps.googleusercontent.com')) {
      const targetUrl = `${authUrl}?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${encodeURIComponent(
        'openid email profile'
      )}&prompt=select_account`;
      window.location.href = targetUrl;
      return;
    }

    // Otherwise, open the Hand-Drawn Google Account Chooser popup so the user can choose which account to use!
    setIsGoogleChooserOpen(true);
  };

  const isPasswordTooShort = mode === 'register' && password.length > 0 && password.length < 6;
  const hasConfirmInput = mode === 'register' && confirmPassword.length > 0;
  const isPasswordMatch = hasConfirmInput && password === confirmPassword;
  const isPasswordMismatch = hasConfirmInput && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Email dan password wajib diisi ya!');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password minimal 6 karakter supaya akunmu aman.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password belum sama.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        const res = await registerAccount(email.trim(), password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Gagal membuat akun baru.');
        }
      } else {
        const res = await loginAccount(email.trim(), password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Email atau password tidak sesuai.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-5">
        {/* Top Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center doodle-btn w-14 h-14 bg-highlight">
            <DoodleIcon name="paw" className="w-9 h-9" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            diCatat.
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Buku Jurnal Keuangan Pribadi Bareng Si Kucing Oren Akuntan
          </p>
        </div>

        {/* Main Hand-Drawn Auth Card */}
        <div className="doodle-card bg-paper-card p-6 sm:p-7 space-y-5 relative">
          {/* Mode Switch Tabs: Buat Akun Baru vs Masuk */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 font-display font-bold text-xs sm:text-sm transition-all ${mode === 'register'
                  ? 'doodle-item-active bg-highlight text-ink -translate-y-0.5'
                  : 'doodle-item bg-paper text-ink-muted hover:bg-paper-warm'
                }`}
            >
              Buat Akun Baru
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 font-display font-bold text-xs sm:text-sm transition-all ${mode === 'login'
                  ? 'doodle-item-active bg-mint text-ink -translate-y-0.5'
                  : 'doodle-item bg-paper text-ink-muted hover:bg-paper-warm'
                }`}
            >
              Masuk Akun
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleButtonClick}
            className="w-full py-3 doodle-btn bg-sky-soft hover:bg-sky/60 font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-2.5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path
                fill="#2C2A29"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.25 5 12c0-3.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span>
              {mode === 'register'
                ? 'Daftar Cepat dengan Google OAuth'
                : 'Masuk dengan Google OAuth'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t-2 border-dashed border-ink/20" />
            <span className="text-[11px] font-display font-bold text-ink-muted uppercase">
              Atau Pakai Email
            </span>
            <div className="flex-1 border-t-2 border-dashed border-ink/20" />
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-display font-bold mb-1">
                Alamat Email
              </label>
              <div className="doodle-field flex items-center px-3.5">
                <Mail className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-display font-bold">
                  Password
                </label>
                {mode === 'register' && password.length > 0 && (
                  <span
                    className={`text-[11px] font-display font-bold flex items-center gap-1 ${isPasswordTooShort ? 'text-coral-dark' : 'text-ink'
                      }`}
                  >
                    {isPasswordTooShort ? (
                      <>
                        <X className="w-3 h-3 stroke-[3]" />
                        <span>Kurang {6 - password.length} karakter lagi</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Panjang password aman</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div
                className={`doodle-field flex items-center px-3.5 transition-colors ${isPasswordTooShort ? 'bg-coral-soft/60' : ''
                  }`}
              >
                <Lock className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-display font-bold">
                    Konfirmasi Password
                  </label>
                  {hasConfirmInput && (
                    <span
                      className={`text-[11px] font-display font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border border-ink ${isPasswordMatch
                          ? 'bg-mint-soft text-ink'
                          : 'bg-coral-soft text-ink'
                        }`}
                    >
                      {isPasswordMatch ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Password cocok!</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>Password belum cocok</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div
                  className={`doodle-field flex items-center px-3.5 transition-colors ${isPasswordMismatch
                      ? 'bg-coral-soft/60'
                      : isPasswordMatch
                        ? 'bg-mint-soft/50'
                        : ''
                    }`}
                >
                  <Lock className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password"
                    className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                  />
                  {hasConfirmInput && (
                    <span
                      className={`w-5 h-5 rounded-full border border-ink flex items-center justify-center shrink-0 ml-2 ${isPasswordMatch ? 'bg-mint' : 'bg-coral'
                        }`}
                    >
                      {isPasswordMatch ? (
                        <Check className="w-3 h-3 text-ink stroke-[3]" />
                      ) : (
                        <X className="w-3 h-3 text-ink stroke-[3]" />
                      )}
                    </span>
                  )}
                </div>
                {isPasswordMismatch && (
                  <div className="mt-2 doodle-item bg-coral-soft/90 px-3 py-2 flex items-center gap-2 text-[11px] sm:text-xs font-display font-bold text-ink">
                    <DoodleIcon name="warning" className="w-5 h-5 shrink-0" />
                    <span>Konfirmasi password tidak sama dengan password di atas.</span>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 doodle-item bg-coral-soft flex items-center gap-2.5 text-xs font-display font-bold text-ink">
                <DoodleIcon name="warning" className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isPasswordMismatch || isPasswordTooShort}
              className="w-full py-3.5 doodle-btn bg-highlight font-display font-bold text-sm sm:text-base text-ink flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DoodleIcon name="paw" className="w-5 h-5" />
              <span>
                {isLoading
                  ? 'Memproses...'
                  : mode === 'register'
                    ? 'Buat Akun & Mulai Onboarding'
                    : 'Masuk ke Buku diCatat'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Account Shortcut for Testing */}
          <div className="pt-2 border-t border-dashed border-ink/20 text-center">
            <button
              type="button"
              onClick={() => loginAccount('cawren@dicatat.com', 'password')}
              className="text-xs font-display font-bold text-ink-muted hover:text-ink underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Masuk Akun Demo (cawren@dicatat.com — Dengan Data Contoh)</span>
            </button>
          </div>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MODAL (Pilih Akun Google) */}
      {isGoogleChooserOpen && (
        <div
          onClick={() => {
            setIsGoogleChooserOpen(false);
            setUseCustomGoogleAccount(false);
          }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/60 backdrop-blur-[2px] p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="doodle-card w-full max-w-md bg-paper p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 doodle-item bg-sky-soft flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path
                      fill="#2C2A29"
                      d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.25 5 12c0-3.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">
                    Pilih Akun Google
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Untuk melanjutkan ke buku jurnal <strong>diCatat.</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGoogleChooserOpen(false);
                  setUseCustomGoogleAccount(false);
                }}
                className="doodle-item w-8 h-8 bg-paper-card hover:bg-coral-soft flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            {!useCustomGoogleAccount ? (
              <div className="space-y-2.5">
                {MOCK_GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={async () => {
                      setIsGoogleChooserOpen(false);
                      setIsLoading(true);
                      try {
                        await loginWithGoogle(mode === 'register', {
                          email: acc.email,
                          name: acc.name,
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full p-3.5 doodle-item bg-paper-card hover:bg-highlight-soft flex items-center justify-between gap-3 text-left transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center font-display font-bold text-sm text-ink shrink-0"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm text-ink truncate">
                          {acc.name}
                        </p>
                        <p className="text-xs text-ink-muted truncate">{acc.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full border border-ink bg-paper text-[10px] font-display font-bold text-ink shrink-0">
                      {acc.badge}
                    </span>
                  </button>
                ))}

                {/* Option to Use Another Account */}
                <button
                  type="button"
                  onClick={() => setUseCustomGoogleAccount(true)}
                  className="w-full p-3.5 doodle-item bg-paper hover:bg-paper-warm flex items-center gap-3 text-left transition-all"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-ink flex items-center justify-center shrink-0 bg-paper-card">
                    <UserPlus className="w-4 h-4 text-ink" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xs sm:text-sm text-ink">
                      Gunakan akun Google yang lain
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Ketik alamat Gmail yang ingin kamu pakai
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!customGoogleEmail.trim()) return;
                  const cleanEmail = customGoogleEmail.trim();
                  const derivedName =
                    customGoogleName.trim() || cleanEmail.split('@')[0];
                  setIsGoogleChooserOpen(false);
                  setUseCustomGoogleAccount(false);
                  setIsLoading(true);
                  try {
                    await loginWithGoogle(mode === 'register', {
                      email: cleanEmail,
                      name: derivedName,
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Alamat Email Google (Gmail)
                  </label>
                  <div className="doodle-field flex items-center px-3.5">
                    <Mail className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
                    <input
                      type="email"
                      autoFocus
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="nama.kamu@gmail.com"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Nama Profil Google (Opsional)
                  </label>
                  <div className="doodle-field px-3.5">
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Contoh: Cawren"
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold doodle-input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setUseCustomGoogleAccount(false)}
                    className="flex-1 py-2.5 doodle-item bg-paper-card font-display font-bold text-xs text-ink"
                  >
                    Kembali ke Daftar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink"
                  >
                    Lanjutkan dengan Akun Ini
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

