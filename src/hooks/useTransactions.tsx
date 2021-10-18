import { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import { api } from '../services/api';

interface Transaction {
  id: number;
  title: string;
  type: string;
  amount: number;
  category: string;
  createdAt: string;
}

type TransactionInput = Omit<Transaction, 'id' | 'createdAt' >

interface TransactionsProviderProps {
  children: ReactNode;
}

interface TransactionsContextData {
  transactions: Transaction[]; 
  createTransaction: (transaction: TransactionInput) => Promise<void>;
}

export const TransactionsContext = createContext<TransactionsContextData>(
  {} as TransactionsContextData
);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get('/transactions', {
      data: {
        transactions: transactions,
      }
    })
      .then(response => {
        return setTransactions(response.data.transactions);
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTransaction(transaction: TransactionInput) {
    const response = await api.post<
      TransactionInput,
      { data: { transaction: Transaction } }
    >('/transactions', {
      ...transaction,
      createdAt: new Date().toString(),
    });
    setTransactions([...transactions, response.data.transaction]);
  }

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}


export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}