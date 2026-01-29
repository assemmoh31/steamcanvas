
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Transaction } from '../types';
import { useSocial } from './SocialContext';

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addCredits: (amount: number) => void;
  purchaseItem: (price: number, itemName: string) => boolean;
  deductCredits: (amount: number, reason: string) => boolean;
  triggerReferralBonus: (referredUser: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(1250); // Initial mock balance
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { addNotification } = useSocial();

  const addCredits = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
    setTransactions(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'deposit',
        amount,
        timestamp: Date.now()
      },
      ...prev
    ]);
  }, []);

  const triggerReferralBonus = useCallback((referredUser: string) => {
    const bonusAmount = 250;
    setBalance(prev => prev + bonusAmount);
    setTransactions(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'referral_bonus',
        amount: bonusAmount,
        timestamp: Date.now(),
        itemName: `Referral Bonus: ${referredUser}`
      },
      ...prev
    ]);

    addNotification({
      type: 'referral_bonus',
      artistName: 'System',
      artistAvatar: 'https://picsum.photos/seed/bonus/100/100',
      message: `GOLD DROP! Received ${bonusAmount} credits for referring @${referredUser}.`
    });

    // Fire confetti for the gold drop
    if ((window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500']
      });
    }
  }, [addNotification]);

  const purchaseItem = useCallback((price: number, itemName: string) => {
    if (balance >= price) {
      setBalance(prev => prev - price);
      setTransactions(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'purchase',
          amount: price,
          timestamp: Date.now(),
          itemName
        },
        ...prev
      ]);
      return true;
    }
    return false;
  }, [balance]);

  const deductCredits = useCallback((amount: number, reason: string) => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setTransactions(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'purchase',
          amount,
          timestamp: Date.now(),
          itemName: reason
        },
        ...prev
      ]);
      return true;
    }
    return false;
  }, [balance]);

  return (
    <WalletContext.Provider value={{ balance, transactions, addCredits, purchaseItem, deductCredits, triggerReferralBonus }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
