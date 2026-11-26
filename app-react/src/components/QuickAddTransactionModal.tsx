import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Sparkles,
  Upload,
  X,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { TransactionType } from '../types/finance';
import { MascotOren } from './MascotOren';
import { HandDrawnSelect } from './HandDrawnSelect';
import { HandDrawnDatePicker } from './HandDrawnDatePicker';
import { DoodleIcon } from './DoodleIcon';

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'manual' | 'scan';
}

const QUICK_AMOUNT_CHIPS = [
  { label: '+5K', value: 5000 },
  { label: '+10K', value: 10000 },
  { label: '+20K', value: 20000 },
  { label: '+50K', value: 50000 },
  { label: '+100K', value: 100000 },
];

const ADMIN_FEE_PRESETS = [
  { label: 'Tanpa Admin', value: 0 },
  { label: '+1K', value: 1000 },
  { label: '+2K', value: 2000 },
  { label: '+2.5K', value: 2500 },
  { label: '+6.5K', value: 6500 },
];

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'manual',
}) => {
  const { wallets, categories, addTransaction, scanReceiptWithAI } = useFinanceStore();

  // Step 1: Choose Transaction Type / AI Scan
  // Step 2: Nominal Input (Hand-Drawn Numpad + Quick Chips +5K/+10K)
  // Step 3: Category, Wallet, Date & Note
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [adminFee, setAdminFee] = useState<number>(0);
  const [showCustomAdmin, setShowCustomAdmin] = useState<boolean>(false);
  const [walletId, setWalletId] = useState<number>(wallets[0]?.id || 1);
  const [toWalletId, setToWalletId] = useState<number>(wallets[1]?.id || 2);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isAiScanned, setIsAiScanned] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiBadgeText, setAiBadgeText] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    txType === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  const numericAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
  const activeAdminFee = txType !== 'income' ? adminFee : 0;
  const totalWithAdmin = numericAmount + activeAdminFee;

  const handleSelectTypeAndProceed = (type: TransactionType) => {
    setTxType(type);
    if (type === 'income') {
      setAdminFee(0);
      setShowCustomAdmin(false);
    }
    if (type === 'expense') setCategoryId(1);
    if (type === 'income') setCategoryId(6);
    setStep(2);
  };

  const handleNumpad = (key: string) => {
    if (key === 'C') {
      setAmountStr('');
      return;
    }
    if (key === 'DEL') {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '000') {
      if (!amountStr) return;
      setAmountStr((prev) => (prev.length <= 7 ? prev + '000' : prev));
      return;
    }
    if (amountStr.length >= 10) return;
    setAmountStr((prev) => (prev === '0' ? key : prev + key));
  };

  const handleQuickAddChip = (addValue: number) => {
    const nextVal = numericAmount + addValue;
    if (String(nextVal).length <= 10) {
      setAmountStr(String(nextVal));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, runAiOcr: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    const previewUrl = URL.createObjectURL(file);
    setReceiptPreview(previewUrl);

    if (runAiOcr) {
      setIsScanning(true);
      setAiBadgeText(null);
      try {
        const result = await scanReceiptWithAI(file);
        setAmountStr(String(result.amount));
        setDate(result.transaction_date);
        setNote(`${result.merchant_name} — ${result.items_summary}`);
        setTxType('expense');
        setIsAiScanned(true);
        setAiBadgeText(
          `✨ Otomatis diisi Gemini Vision AI (${result.confidence || '98% Akurat'})`
        );

        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === result.suggested_category.toLowerCase()
        );
        if (matchedCat) {
          setCategoryId(matchedCat.id);
        }
        // Jump straight to Step 3 (Review & Save) after AI Scan completes!
        setStep(3);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    const baseNote =
      note.trim() || (txType === 'transfer' ? 'Transfer Antar Dompet' : 'Transaksi Harian');
    const finalNote =
      activeAdminFee > 0
        ? `${baseNote} (+Admin Rp${activeAdminFee.toLocaleString('id-ID')})`
        : baseNote;

    addTransaction({
      wallet_id: walletId,
      to_wallet_id: txType === 'transfer' ? toWalletId : null,
      category_id: categoryId,
      type: txType,
      amount: totalWithAdmin,
      transaction_date: date,
      note: finalNote,
      receipt_image_url: receiptPreview,
      receipt_file: receiptFile,
      is_ai_scanned: isAiScanned,
    });

    setAmountStr('');
    setAdminFee(0);
    setShowCustomAdmin(false);
    setNote('');
    setReceiptFile(null);
    setReceiptPreview(null);
    setIsAiScanned(false);
    setAiBadgeText(null);
    setStep(1);
    onClose();
  };

  const formattedDisplayAmount =
    totalWithAdmin > 0 ? 'Rp ' + totalWithAdmin.toLocaleString('id-ID') : 'Rp 0';

  const typeMeta = {
    expense: {
      title: 'Pengeluaran',
      icon: 'expense',
      bg: 'bg-coral-soft',
      badgeBg: 'bg-coral',
    },
    income: {
      title: 'Pemasukan',
      icon: 'income',
      bg: 'bg-mint-soft',
      badgeBg: 'bg-mint',
    },
    transfer: {
      title: 'Transfer Saldo',
      icon: 'transfer',
      bg: 'bg-sky-soft',
      badgeBg: 'bg-sky',
    },
  }[txType];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="doodle-card w-full max-w-lg flex flex-col bg-paper animate-in slide-in-from-bottom duration-200">
        <div className="w-full p-5 sm:p-6">
          {/* Top Grab Handle for mobile */}
          <div className="w-12 h-1.5 bg-ink/25 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-ink flex items-center gap-2">
                <DoodleIcon name="pencil" className="w-6 h-6" />
                <span>
                  {step === 1
                    ? 'Mau Catat Apa Hari Ini?'
                    : step === 2
                    ? 'Masukkan Nominal'
                    : 'Detail & Simpan'}
                </span>
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                {step === 1
                  ? 'Pilih jenis catatan atau scan struk belanja otomatis'
                  : step === 2
                  ? 'Ketik dengan numpad atau gunakan tombol tambah cepat'
                  : 'Pilih kategori, dompet, & tanggal transaksi'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="doodle-item w-9 h-9 bg-paper-card flex items-center justify-center hover:bg-coral-soft shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 1: LARGE EXPRESSIVE CARDS FOR TRANSACTION TYPE & AI RECEIPT SCAN */}
          {step === 1 && (
            <div className="space-y-3">
              {isScanning ? (
                <div className="p-5 doodle-item-active bg-sky-soft">
                  <MascotOren
                    mood="scanning"
                    size="md"
                    message="Meong! Si Oren lagi baca angka, tanggal & nama toko di strukmu pakai Gemini Vision AI..."
                  />
                </div>
              ) : (
                <>
                  {/* Card 1: Pengeluaran */}
                  <button
                    type="button"
                    onClick={() => handleSelectTypeAndProceed('expense')}
                    className="w-full p-4 doodle-item-active bg-coral-soft hover:bg-coral/40 text-left flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="doodle-item w-12 h-12 bg-coral flex items-center justify-center shrink-0">
                        <DoodleIcon name="expense" className="w-8 h-8" />
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                          Catat Pengeluaran
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          Jajan kopi, makan siang, belanja bulanan, atau bayar tagihan
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Card 2: Pemasukan */}
                  <button
                    type="button"
                    onClick={() => handleSelectTypeAndProceed('income')}
                    className="w-full p-4 doodle-item bg-mint-soft hover:bg-mint/40 text-left flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="doodle-item w-12 h-12 bg-mint flex items-center justify-center shrink-0">
                        <DoodleIcon name="income" className="w-8 h-8" />
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                          Catat Pemasukan
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          Gaji bulanan, uang saku, bonus, atau bayaran project freelance
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Card 3: Transfer Antar Dompet */}
                  <button
                    type="button"
                    onClick={() => handleSelectTypeAndProceed('transfer')}
                    className="w-full p-4 doodle-item bg-sky-soft hover:bg-sky/40 text-left flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="doodle-item w-12 h-12 bg-sky flex items-center justify-center shrink-0">
                        <DoodleIcon name="transfer" className="w-7 h-7" />
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                          Transfer Antar Dompet
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          Pindahkan saldo dari Rekening Bank ke E-Wallet atau tarik tunai
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 border-t-2 border-dashed border-ink/20" />
                    <span className="text-[11px] font-display font-bold text-ink-muted uppercase">
                      Atau Otomatis Pakai AI
                    </span>
                    <div className="flex-1 border-t-2 border-dashed border-ink/20" />
                  </div>

                  {/* Card 4: AI Receipt Scanner */}
                  <label className="cursor-pointer w-full p-4 doodle-item-active bg-highlight-soft hover:bg-highlight/60 text-left flex items-center justify-between gap-3 group transition-all">
                    <div className="flex items-center gap-3.5">
                      <span className="doodle-item w-12 h-12 bg-highlight flex items-center justify-center shrink-0">
                        <DoodleIcon name="camera" className="w-8 h-8" />
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                          Scan Struk Otomatis
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          Upload / foto struk belanja, Si Oren langsung isi nominal & tokonya!
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                    <ArrowRight className="w-5 h-5 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
                  </label>
                </>
              )}
            </div>
          )}

          {/* STEP 2: FOCUSED NOMINAL, QUICK CHIPS (+5K, +10K...) & HAND-DRAWN NUMPAD */}
          {step === 2 && (
            <div className="space-y-3.5">
              {/* Amount Display Box colored by selected Transaction Type */}
              <div className={`p-3.5 doodle-card ${typeMeta.bg} text-center relative`}>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-card/80 text-[11px] font-display font-bold uppercase tracking-wider text-ink mb-0.5">
                  <DoodleIcon name={typeMeta.icon} className="w-3.5 h-3.5" />
                  <span>Total {typeMeta.title}</span>
                </div>
                <div className="font-display font-bold text-3xl text-ink tracking-tight my-0.5">
                  {formattedDisplayAmount}
                </div>
                {activeAdminFee > 0 && (
                  <p className="text-[11px] font-semibold text-ink-muted">
                    Pokok Rp {numericAmount.toLocaleString('id-ID')} + Biaya Admin{' '}
                    <strong className="text-ink">
                      Rp {activeAdminFee.toLocaleString('id-ID')}
                    </strong>
                  </p>
                )}
              </div>

              {/* QUICK AMOUNT CHIPS (+5K, +10K, +20K, +50K, +100K) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-display font-bold text-ink-muted">
                    Tambah Cepat:
                  </span>
                  {(numericAmount > 0 || activeAdminFee > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAmountStr('');
                        setAdminFee(0);
                        setShowCustomAdmin(false);
                      }}
                      className="text-[11px] font-display font-bold text-coral-dark hover:underline"
                    >
                      Reset Rp 0
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {QUICK_AMOUNT_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleQuickAddChip(chip.value)}
                      className="doodle-item py-1.5 px-1 bg-highlight-soft hover:bg-highlight font-display font-bold text-xs text-ink active:translate-y-0.5"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BIAYA ADMIN CHIPS (+1K, +2K, +2.5K, +6.5K, Custom) FOR EXPENSE & TRANSFER */}
              {txType !== 'income' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[11px] font-display font-bold text-ink-muted">
                      + Biaya Admin (QRIS / Top-Up / Bank):
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomAdmin((prev) => !prev)}
                      className="text-[11px] font-display font-bold text-ink underline hover:text-oren-dark"
                    >
                      {showCustomAdmin ? 'Tutup Custom' : 'Nominal Lain'}
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ADMIN_FEE_PRESETS.map((preset) => {
                      const isSelected = adminFee === preset.value && !showCustomAdmin;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setAdminFee(preset.value);
                            setShowCustomAdmin(false);
                          }}
                          className={`py-1.5 px-1 font-display font-bold text-[11px] transition-all ${
                            isSelected
                              ? 'doodle-item-active bg-coral-soft text-ink -translate-y-0.5'
                              : 'doodle-item bg-paper-card hover:bg-paper-warm text-ink-muted'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {showCustomAdmin && (
                    <div className="mt-2 doodle-field flex items-center px-3 py-1.5 bg-paper-card">
                      <span className="text-xs font-display font-bold text-ink-muted mr-2">
                        Admin Rp
                      </span>
                      <input
                        type="number"
                        step={500}
                        min={0}
                        value={adminFee || ''}
                        onChange={(e) =>
                          setAdminFee(Math.max(0, parseInt(e.target.value, 10) || 0))
                        }
                        placeholder="Contoh: 1500 atau 3000"
                        className="w-full text-xs font-display font-bold text-ink doodle-input"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Hand-Drawn Numpad */}
              <div className="grid grid-cols-4 gap-1.5">
                {['1', '2', '3', 'C', '4', '5', '6', '000', '7', '8', '9', 'DEL', '0'].map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNumpad(key)}
                      className={`doodle-item py-2.5 font-display font-bold text-sm active:translate-y-0.5 ${
                        key === 'C'
                          ? 'bg-coral-soft text-ink'
                          : key === 'DEL'
                          ? 'bg-highlight-soft text-ink text-xs'
                          : key === '000'
                          ? 'bg-mint-soft text-ink text-xs'
                          : key === '0'
                          ? 'col-span-4 bg-paper-card py-2'
                          : 'bg-paper-card hover:bg-paper-warm'
                      }`}
                    >
                      {key === 'DEL' ? '⌫ Hapus' : key}
                    </button>
                  )
                )}
              </div>

              {/* Bottom Action Row: Back (Ganti Jenis) & Next Step */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 doodle-item bg-paper-card font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-1 hover:bg-paper-warm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  disabled={numericAmount <= 0}
                  onClick={() => setStep(3)}
                  className="col-span-2 py-3 doodle-btn bg-highlight font-display font-bold text-xs sm:text-sm text-ink disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>Lanjut Pilih Kategori</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CATEGORY, WALLET, DATE, NOTE & SAVE */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Compact Nominal & Type Summary Bar */}
              <div className={`p-3 doodle-item ${typeMeta.bg} flex items-center justify-between gap-2`}>
                <div>
                  <span className="text-[11px] font-semibold text-ink-muted block">
                    {typeMeta.title}
                  </span>
                  <span className="font-display font-bold text-xl text-ink">
                    {formattedDisplayAmount}
                  </span>
                  {activeAdminFee > 0 && (
                    <span className="block text-[11px] font-semibold text-ink-muted">
                      Termasuk Biaya Admin Rp {activeAdminFee.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="doodle-item bg-paper-card px-3 py-1.5 text-xs font-display font-bold flex items-center gap-1 hover:bg-paper-warm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ubah Angka</span>
                </button>
              </div>

              {aiBadgeText && (
                <div className="px-3 py-2 doodle-item bg-mint-soft text-xs font-semibold flex items-center justify-between">
                  <span>{aiBadgeText}</span>
                  <Check className="w-4 h-4 text-ink shrink-0" />
                </div>
              )}

              {/* Category Pill Grid (if not transfer) */}
              {txType !== 'transfer' && (
                <div>
                  <label className="block text-xs font-display font-bold mb-1.5">
                    Pilih Kategori
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredCategories.map((cat) => {
                      const selected = cat.id === categoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs text-left transition-all ${
                            selected
                              ? 'doodle-item-active bg-highlight -translate-y-0.5 font-bold text-ink'
                              : 'doodle-item bg-paper-card font-semibold text-ink hover:bg-paper-warm'
                          }`}
                        >
                          <DoodleIcon name={cat.icon} className="w-5 h-5" />
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Wallet Selection & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    {txType === 'transfer' ? 'Dari Dompet' : 'Pilih Dompet'}
                  </label>
                  <HandDrawnSelect
                    value={walletId}
                    onChange={(val) => setWalletId(Number(val))}
                    options={wallets.map((w) => ({
                      value: w.id,
                      label: w.name,
                      icon: w.icon,
                      sublabel: `Rp${w.balance.toLocaleString('id-ID')}`,
                      color: w.color,
                    }))}
                  />
                </div>

                {txType === 'transfer' ? (
                  <div>
                    <label className="block text-xs font-display font-bold mb-1 flex items-center gap-1">
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Ke Dompet Tujuan
                    </label>
                    <HandDrawnSelect
                      value={toWalletId}
                      onChange={(val) => setToWalletId(Number(val))}
                      options={wallets
                        .filter((w) => w.id !== walletId)
                        .map((w) => ({
                          value: w.id,
                          label: w.name,
                          icon: w.icon,
                          sublabel: `Rp${w.balance.toLocaleString('id-ID')}`,
                          color: w.color,
                        }))}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-display font-bold mb-1">Tanggal</label>
                    <HandDrawnDatePicker value={date} onChange={setDate} />
                  </div>
                )}
              </div>

              {/* Note & Manual Receipt Image Attachment */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-display font-bold mb-1">
                    Catatan / Nama Toko (Opsional)
                  </label>
                  <div className="doodle-field">
                    <input
                      type="text"
                      placeholder="Contoh: Kopi Kenangan, Nasi Padang, Token Listrik..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm doodle-input"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="cursor-pointer doodle-item inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-paper-warm hover:bg-highlight-soft">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{receiptPreview ? 'Ganti Foto Struk' : 'Lampirkan Foto Struk'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                  </label>

                  {receiptPreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={receiptPreview}
                        alt="Preview Struk"
                        className="w-9 h-9 object-cover rounded-lg border-2 border-ink"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptFile(null);
                          setReceiptPreview(null);
                        }}
                        className="text-xs text-coral-dark font-bold underline"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Back & Save */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 doodle-item bg-paper-card font-display font-bold text-xs sm:text-sm text-ink flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="submit"
                  className="col-span-2 py-3 doodle-btn bg-highlight font-display font-bold text-sm sm:text-base text-ink flex items-center justify-center gap-2"
                >
                  <DoodleIcon name="paw" className="w-5 h-5" />
                  <span>Simpan ke Buku diCatat</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
