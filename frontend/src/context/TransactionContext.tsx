import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAllPayments } from "../services/adminService";

interface Transaction {
  id: string;
  txId: string;
  customerName: string;
  serviceType: "Hotel" | "Destinasi" | "Transportasi" | "Grup Wisata";
  serviceName: string;
  amount: string;
  date: string;
  status: "Menunggu" | "Berhasil" | "Ditolak";
  proofImg: string;
  isSplitBill?: boolean;
  totalGroupBill?: string;
  splitCount?: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  refreshPayments: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  isLoading: true,
  refreshPayments: async () => {},
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllPayments();
      setTransactions(response.data);
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPayments();
  }, [refreshPayments]);

  return (
    <TransactionContext.Provider value={{ transactions, isLoading, refreshPayments }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => useContext(TransactionContext);