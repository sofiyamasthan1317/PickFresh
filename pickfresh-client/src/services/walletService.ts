import { api } from "./api";

export type WalletTransaction = {
  _id: string;
  type: "credit" | "debit" | "refund" | "cashback" | "payment";
  amount: number;
  description: string;
  status: "pending" | "completed" | "failed";
  order?: string | null;
  createdAt: string;
};

export type WalletData = {
  balance: number;
  transactions?: WalletTransaction[];
  pagination?: { total: number; page: number; pages: number; limit: number };
};

export type TransactionPage = {
  transactions: WalletTransaction[];
  pagination: { total: number; page: number; pages: number; limit: number };
};

export const walletService = {
  async getBalance(): Promise<WalletData> {
    const res = await api.get("/wallet/balance");
    return res.data.data;
  },

  async getTransactions(page = 1, limit = 10, type = "all"): Promise<TransactionPage> {
    const res = await api.get("/wallet/transactions", { params: { page, limit, type } });
    return res.data.data;
  },

  async addMoney(amount: number, description?: string): Promise<{ balance: number; transaction: WalletTransaction }> {
    const res = await api.post("/wallet/add-money", { amount, description });
    return res.data.data;
  },

  async pay(amount: number, description?: string, orderId?: string): Promise<{ balance: number; transaction: WalletTransaction }> {
    const res = await api.post("/wallet/pay", { amount, description, orderId });
    return res.data.data;
  },
};
