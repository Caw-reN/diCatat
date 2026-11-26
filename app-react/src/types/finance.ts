export type WalletType = 'cash' | 'bank' | 'ewallet';
export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Wallet {
  id: number;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  icon: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  is_default?: boolean;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  to_wallet_id?: number | null;
  category_id: number;
  type: TransactionType;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  note: string;
  receipt_image_url?: string | null;
  receipt_file?: File | null;
  is_ai_scanned?: boolean;
}

export interface Budget {
  id: number;
  category_id: number | null; // null = total monthly budget
  amount_limit: number;
  month_year: string; // YYYY-MM
}

export interface ScannedReceiptResult {
  merchant_name: string;
  amount: number;
  transaction_date: string;
  suggested_category: string;
  items_summary: string;
  confidence?: string;
}

