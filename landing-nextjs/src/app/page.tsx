'use client';

import React, { useState } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import {
  Camera,
  Sparkles,
  Wallet,
  PieChart,
  Target,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Smartphone,
} from 'lucide-react';

type MascotPreviewMood = 'happy' | 'warning' | 'crying' | 'scanning';

export default function LandingPage() {
  const [previewMood, setPreviewMood] = useState<MascotPreviewMood>('happy');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

  const moodDescriptions: Record<
    MascotPreviewMood,
    { title: string; badge: string; desc: string; bg: string; pct: string }
  > = {
    happy: {
      title: 'Mode Hemat & Santai (< 75% Budget)',
      badge: '😸 Dompet Sehat!',
      desc: 'Saat pengeluaranmu masih jauh di bawah batas budget bulanan, Si Oren tersenyum santai sambil mencatat buku jurnalmu.',
      bg: 'bg-mint-soft',
      pct: '42% Budget Terpakai',
    },
    warning: {
      title: 'Mode Waspada! (75% – 99% Budget)',
      badge: '🙀 Mulai Keringat Dingin!',
      desc: 'Ketika jajan kopi mulai menguras anggaran, Si Oren berkeringat dingin mengingatkan berapa sisa uang amanmu bulan ini.',
      bg: 'bg-highlight-soft',
      pct: '86% Budget Terpakai',
    },
    crying: {
      title: 'Mode Darurat Overbudget (≥ 100% Budget)',
      badge: '😿 Nangis Dompet Kosong!',
      desc: 'Kalau pengeluaran menembus batas anggaran, Si Oren menangis deras supaya kamu sadar dan mengerem pengeluaran impulsif!',
      bg: 'bg-coral-soft',
      pct: '115% Overbudget!',
    },
    scanning: {
      title: 'Mode Detektif Scan Struk (Gemini Vision AI)',
      badge: '🔍 Lagi Baca Struk Belanja...',
      desc: 'Malas ketik satu-satu? Foto saja struk minimarket atau kopimu, Si Oren langsung membaca nominal, tanggal, dan kategorinya!',
      bg: 'bg-sky-soft',
      pct: 'AI OCR Otomatis',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* STICKY HAND-DRAWN NAVBAR */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b-[3px] border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-highlight border-2 border-ink shadow-doodle-sm flex items-center justify-center text-xl">
              🐾
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight">diCatat.</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-mint-soft border border-ink text-[11px] font-hand font-bold">
                Cozy Doodle Finance
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-display font-semibold">
            <a href="#cerita" className="hover:underline">
              Cerita Si Oren
            </a>
            <a href="#fitur" className="hover:underline">
              Fitur Utama
            </a>
            <a href="#maskot" className="hover:underline">
              Ekspresi Maskot
            </a>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
          </nav>

          <a
            href={appUrl}
            className="doodle-btn bg-highlight px-4 py-2 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5"
          >
            <span>Buka Aplikasi</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* HERO SECTION WITH ROUGH NOTATION & MASCOT SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 md:py-20">
        <RoughNotationGroup show={true}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper-card border-2 border-ink shadow-doodle-sm text-xs font-display font-bold">
                <Sparkles className="w-4 h-4 text-oren-dark" />
                <span>Aplikasi Pencatat Keuangan Bergaya Buku Jurnal Doodle</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight">
                Catat Uang Nggak Lagi Kaku, Ditemani{' '}
                <RoughNotation type="highlight" color="#FFE066" animationDuration={900}>
                  <span className="px-2">Si Kucing Oren</span>
                </RoughNotation>{' '}
                Akuntan! 🐾
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl">
                Lupakan tabel spreadsheet yang membosankan. Di <strong>diCatat</strong>, setiap
                pengeluaran terasa seperti menulis di buku jurnal pastel lengkap dengan{' '}
                <RoughNotation type="underline" color="#FF8B94" strokeWidth={3}>
                  <strong className="text-ink">Scan Struk AI Gemini</strong>
                </RoughNotation>
                , multi-dompet, dan maskot yang ikut panik kalau kamu kebanyakan jajan kopi!
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={appUrl}
                  className="doodle-btn bg-highlight px-6 py-3.5 font-display font-bold text-base flex items-center gap-2"
                >
                  <span>🐾 Mulai diCatat Sekarang — Gratis!</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#maskot"
                  className="doodle-btn bg-paper-card px-5 py-3.5 font-display font-bold text-sm"
                >
                  Lihat Reaksi Si Oren 😸
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs sm:text-sm font-hand text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-ink" /> Mobile-First & Responsif
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-ink" /> Scan Struk Otomatis (Gemini AI)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-ink" /> Grafik Arsiran Rough.js
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Mobile Notebook Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm doodle-card bg-paper-warm p-5 space-y-4">
                <div className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 text-xs font-hand font-bold">
                  Preview Tampilan Mobile
                </div>

                {/* Top Phone Header */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-highlight border-2 border-ink flex items-center justify-center">
                      🐾
                    </span>
                    <div>
                      <p className="font-display font-bold text-sm leading-none">diCatat.</p>
                      <span className="text-[11px] font-hand text-ink-muted">
                        Jurnal Harianmu
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-mint-soft border border-ink text-[11px] font-display font-bold">
                    📱 Mobile-First
                  </span>
                </div>

                {/* Mock Balance Card */}
                <div className="p-4 rounded-2xl bg-highlight-soft border-2 border-ink shadow-doodle-sm">
                  <span className="text-[11px] font-hand text-ink-muted">
                    Total Saldo Semua Dompet
                  </span>
                  <p className="font-display font-bold text-2xl text-ink mt-0.5">
                    Rp 5.625.000
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded-xl bg-mint-soft border border-ink">
                      <span className="text-[10px] font-hand block">Pemasukan</span>
                      <strong className="font-display">+Rp 6.500.000</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-coral-soft border border-ink">
                      <span className="text-[10px] font-hand block">Pengeluaran</span>
                      <strong className="font-display">-Rp 875.000</strong>
                    </div>
                  </div>
                </div>

                {/* Mini Mascot Speech inside Mockup */}
                <div className="p-3.5 rounded-2xl bg-paper-card border-2 border-ink shadow-doodle-sm flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-oren border-2 border-ink flex items-center justify-center text-3xl shrink-0">
                    🐱
                  </div>
                  <div className="text-xs">
                    <span className="font-display font-bold bg-highlight px-2 py-0.5 rounded-full border border-ink">
                      Si Oren Akuntan
                    </span>
                    <p className="mt-1 text-ink font-medium">
                      &ldquo;Struk Kopi Kenangan Rp38.000 sudah otomatis kucatat dari foto ya!&rdquo;
                    </p>
                  </div>
                </div>

                {/* Mock Recent Transactions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper-card border-2 border-ink text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-coral-soft border border-ink flex items-center justify-center">
                        🍜
                      </span>
                      <div>
                        <p className="font-display font-bold">Kopi Susu & Croissant</p>
                        <span className="text-[10px] font-hand text-ink-muted">
                          GoPay • ✨ AI Struk
                        </span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-ink">-Rp38.000</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-paper-card border-2 border-ink text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-sky-soft border border-ink flex items-center justify-center">
                        🛵
                      </span>
                      <div>
                        <p className="font-display font-bold">GoRide ke Stasiun MRT</p>
                        <span className="text-[10px] font-hand text-ink-muted">
                          GoPay • Kemarin
                        </span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-ink">-Rp24.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RoughNotationGroup>
      </section>

      {/* STORYTELLING SECTION: 3-PANEL COMIC STRIP */}
      <section id="cerita" className="py-16 bg-paper-warm border-y-[3px] border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-highlight border-2 border-ink text-xs font-hand font-bold uppercase">
              📖 Kenapa Harus diCatat?
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              Dari &ldquo;Kok Gaji Tiba-Tiba Habis?&rdquo; Jadi Tenang Setiap Akhir Bulan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 doodle-card bg-paper-card space-y-3 relative">
              <span className="font-display font-bold text-xs px-2.5 py-1 rounded-full bg-coral-soft border border-ink">
                Panel 1 • Masalah Klasik
              </span>
              <div className="text-4xl">😵‍💫🧾</div>
              <h3 className="font-display font-bold text-xl">
                Struk Menumpuk & Malas Buka Aplikasi Kaku
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Habis belanja di minimarket atau beli kopi, struknya cuma numpuk di kantong karena
                aplikasi keuangan biasa terlalu rumit seperti software kantor.
              </p>
            </div>

            <div className="p-6 doodle-card bg-highlight-soft space-y-3 relative">
              <span className="font-display font-bold text-xs px-2.5 py-1 rounded-full bg-paper-card border border-ink">
                Panel 2 • Jepret Bareng Si Oren
              </span>
              <div className="text-4xl">📸🐱</div>
              <h3 className="font-display font-bold text-xl">
                Foto Struk 2 Detik, Gemini AI Langsung Mencatat!
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Cukup foto struk belanjamu! Si Kucing Oren Akuntan bertenaga Gemini Flash Vision
                langsung mengisi angka, nama toko, dan kategorinya secara otomatis.
              </p>
            </div>

            <div className="p-6 doodle-card bg-mint-soft space-y-3 relative">
              <span className="font-display font-bold text-xs px-2.5 py-1 rounded-full bg-paper-card border border-ink">
                Panel 3 • Dompet Terkendali
              </span>
              <div className="text-4xl">🎉📓</div>
              <h3 className="font-display font-bold text-xl">
                Grafik Doodle & Insight Pintar yang Jujur
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Lihat porsi pengeluaranmu lewat Donut Chart gambar tangan (*Rough.js*), kalender
                harian, dan nasihat pintar dari Si Oren setiap minggu!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE MASCOT SHOWCASE SECTION */}
      <section id="maskot" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-mint-soft border-2 border-ink text-xs font-hand font-bold uppercase">
            🐱 Kenalan Sama Maskot Kita
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl">
            Si Kucing Oren Akuntan yang Bereaksi Sesuai Kondisi Dompetmu!
          </h2>
          <p className="text-sm sm:text-base text-ink-muted">
            Klik tombol mood di bawah untuk melihat bagaimana Si Oren berubah ekspresi di dashboard
            diCatat:
          </p>
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { id: 'happy', label: '😸 Mode Hemat (<75%)' },
            { id: 'warning', label: '🙀 Mode Waspada (75-99%)' },
            { id: 'crying', label: '😿 Mode Overbudget (≥100%)' },
            { id: 'scanning', label: '🔍 Mode Scan Struk AI' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPreviewMood(btn.id as MascotPreviewMood)}
              className={`px-4 py-2.5 doodle-btn font-display font-bold text-xs sm:text-sm ${
                previewMood === btn.id ? 'bg-highlight' : 'bg-paper-card'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Interactive Mascot Stage Card */}
        <div
          className={`max-w-3xl mx-auto p-6 sm:p-8 doodle-card ${moodDescriptions[previewMood].bg} transition-colors duration-300`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Large Hand-Drawn Cat SVG */}
            <div className="w-36 h-36 shrink-0 rounded-3xl bg-paper-card border-[3px] border-ink shadow-doodle flex items-center justify-center p-2">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Ears */}
                <path
                  d="M42 84 C34 45, 42 32, 75 54 Z"
                  fill="#FF9F43"
                  stroke="#2C2A29"
                  strokeWidth="4.5"
                />
                <path
                  d="M158 84 C166 45, 158 32, 125 54 Z"
                  fill="#FF9F43"
                  stroke="#2C2A29"
                  strokeWidth="4.5"
                />
                {/* Accountant Visor */}
                <path
                  d="M55 56 C78 44, 122 44, 145 56 L154 68 C120 58, 80 58, 46 68 Z"
                  fill="#A8E6CF"
                  stroke="#2C2A29"
                  strokeWidth="4"
                />
                {/* Head */}
                <path
                  d="M38 102 C36 67, 65 52, 100 52 C135 52, 164 67, 162 102 C160 135, 136 149, 100 149 C64 149, 40 135, 38 102 Z"
                  fill="#FF9F43"
                  stroke="#2C2A29"
                  strokeWidth="4.5"
                />
                {/* Glasses */}
                <circle
                  cx="73"
                  cy="98"
                  r="19"
                  fill="rgba(255,253,247,0.45)"
                  stroke="#2C2A29"
                  strokeWidth="4"
                />
                <circle
                  cx="127"
                  cy="98"
                  r="19"
                  fill="rgba(255,253,247,0.45)"
                  stroke="#2C2A29"
                  strokeWidth="4"
                />
                <path d="M92 98 Q100 92 108 98" stroke="#2C2A29" strokeWidth="4" fill="none" />

                {previewMood === 'happy' && (
                  <>
                    <path
                      d="M64 98 Q73 87 82 98 M118 98 Q127 87 136 98"
                      stroke="#2C2A29"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M88 117 Q94 124 100 118 Q106 124 112 117"
                      stroke="#2C2A29"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                )}

                {previewMood === 'warning' && (
                  <>
                    <circle cx="73" cy="98" r="6" fill="#2C2A29" />
                    <circle cx="127" cy="98" r="6" fill="#2C2A29" />
                    <path
                      d="M86 121 Q93 115 100 121 Q107 127 114 121"
                      stroke="#2C2A29"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      d="M155 72 C155 72, 165 85, 155 91 C145 85, 155 72, 155 72 Z"
                      fill="#A0C4FF"
                      stroke="#2C2A29"
                      strokeWidth="3"
                    />
                  </>
                )}

                {previewMood === 'crying' && (
                  <>
                    <path
                      d="M65 92 L79 98 L65 104 M135 92 L121 98 L135 104"
                      stroke="#2C2A29"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M68 106 Q62 125 66 142 M132 106 Q138 125 134 142"
                      stroke="#A0C4FF"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M90 124 C90 112, 110 112, 110 124 Z"
                      fill="#FF8B94"
                      stroke="#2C2A29"
                      strokeWidth="3.5"
                    />
                  </>
                )}

                {previewMood === 'scanning' && (
                  <>
                    <circle cx="73" cy="98" r="6.5" fill="#2C2A29" />
                    <circle cx="127" cy="98" r="6.5" fill="#2C2A29" />
                    <circle
                      cx="148"
                      cy="128"
                      r="18"
                      fill="rgba(160, 196, 255, 0.6)"
                      stroke="#2C2A29"
                      strokeWidth="4"
                    />
                    <path
                      d="M160 141 L175 156"
                      stroke="#2C2A29"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-paper-card border-2 border-ink font-display font-bold text-xs">
                  {moodDescriptions[previewMood].badge}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-highlight border border-ink font-hand font-bold text-xs">
                  {moodDescriptions[previewMood].pct}
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl">
                {moodDescriptions[previewMood].title}
              </h3>
              <p className="text-sm sm:text-base text-ink leading-relaxed">
                {moodDescriptions[previewMood].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="fitur" className="py-16 bg-paper-warm border-t-[3px] border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-sky-soft border-2 border-ink text-xs font-hand font-bold uppercase">
              ✨ Fitur Lengkap diCatat
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              Dirancang Khusus untuk Kemudahan Mencatat Setiap Hari
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                title: 'Scan Struk AI (Gemini Vision)',
                desc: 'Unggah atau foto struk belanja, sistem backend Laravel + Gemini API otomatis mendeteksi nominal, tanggal, nama merchant, dan kategori.',
                bg: 'bg-highlight-soft',
              },
              {
                icon: Wallet,
                title: 'Multi-Wallet & Transfer Antar Dompet',
                desc: 'Pisahkan saldo Tunai, Rekening BCA, dan E-Wallet (GoPay/OVO) lengkap dengan fitur transfer/top-up antar dompet.',
                bg: 'bg-sky-soft',
              },
              {
                icon: Target,
                title: 'Budgeting Bulanan per Kategori',
                desc: 'Pasang batas maksimal pengeluaran Makan, Transport, hingga Belanja dengan indikator warna stabilo & reaksi maskot.',
                bg: 'bg-mint-soft',
              },
              {
                icon: PieChart,
                title: 'Donut Chart Arsiran Tangan (Rough.js)',
                desc: 'Visualisasi porsi pengeluaran dengan grafik arsiran krayon/gambar tangan ditambah kalender transaksi harian interaktif.',
                bg: 'bg-coral-soft',
              },
              {
                icon: Sparkles,
                title: 'Insight & Ringkasan Pintar',
                desc: 'Si Oren memberikan ringkasan otomatis tentang kategori paling boros dan rata-rata pengeluaran harianmu.',
                bg: 'bg-paper-card',
              },
              {
                icon: Smartphone,
                title: 'Mobile-First & Responsive Desktop',
                desc: 'Nyaman dipakai satu tangan di HP dengan Bottom Nav, dan otomatis melebar menjadi Dashboard Sidebar ketika dibuka di laptop.',
                bg: 'bg-paper-card',
              },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className={`p-6 doodle-card ${feat.bg} space-y-3`}>
                  <div className="w-11 h-11 rounded-2xl bg-paper-card border-2 border-ink shadow-doodle-sm flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg">{feat.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-highlight border-2 border-ink text-xs font-hand font-bold uppercase">
            ❓ Tanya Jawab (FAQ)
          </span>
          <h2 className="font-display font-bold text-3xl">Pertanyaan yang Sering Ditanyakan</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Bagaimana cara kerja fitur Scan Struk Otomatis (AI OCR)?',
              a: 'Saat kamu mengunggah foto struk di aplikasi React diCatat, gambar dikirim ke backend Laravel lalu diproses oleh Google Gemini Flash Vision API menjadi data JSON terstruktur (nominal, tanggal, nama toko, & kategori) dalam hitungan detik.',
            },
            {
              q: 'Apakah saya bisa menambah dompet dan kategori sendiri?',
              a: 'Bisa banget! Selain kategori bawaan, kamu bebas membuat kategori baru lengkap dengan pilihan ikon doodle dan warna pastel, serta menambah dompet Tunai, Bank, maupun E-Wallet.',
            },
            {
              q: 'Apakah nyaman dibuka dari HP maupun Laptop?',
              a: 'Ya! diCatat dirancang Mobile-First dengan navigasi bawah (Bottom Navigation Bar) saat dibuka di HP, dan otomatis berubah menjadi tampilan Dashboard dengan Sidebar saat dibuka di layar laptop/desktop.',
            },
          ].map((item) => (
            <div key={item.q} className="p-5 doodle-card bg-paper-card space-y-1.5">
              <h4 className="font-display font-bold text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-oren-dark shrink-0" />
                <span>{item.q}</span>
              </h4>
              <p className="text-sm text-ink-muted pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="mt-auto border-t-[3px] border-ink bg-highlight-soft py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-highlight border-2 border-ink shadow-doodle text-3xl">
            🐾
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl">
            Siap Merapikan Keuanganmu Bareng Si Oren?
          </h2>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto">
            Yuk mulai catat pengeluaran pertamamu atau coba fitur Scan Struk AI sekarang juga!
          </p>
          <div className="pt-2">
            <a
              href={appUrl}
              className="inline-flex items-center gap-2 doodle-btn bg-highlight px-7 py-3.5 font-display font-bold text-base"
            >
              <span>🚀 Buka Aplikasi Web diCatat</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs font-hand text-ink-muted pt-6">
            Dibuat dengan tema Cozy Doodle & Pastel Notebook • Laravel + React + Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}

