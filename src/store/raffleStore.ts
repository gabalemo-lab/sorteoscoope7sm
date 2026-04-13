import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaymentMethod = 'alias1' | 'alias2' | 'alias3';

export interface Prize {
  id: number;
  name: string;
  description: string;
  photo: string | null;
  enabled: boolean;
}

export interface PaymentConfig {
  alias1: string;
  alias2: string;
  alias2QR: string | null;
  alias2CBU: string;
  alias3: string;
  alias3QR: string | null;
  alias3CBU: string;
}

export interface PriceConfig {
  singlePrice: number;
  doublePrice: number;
  doubleEnabled: boolean;
}

export interface Purchase {
  id: string;
  numbers: number[];
  buyerName: string;
  buyerPhone: string;
  paymentMethod: PaymentMethod;
  timestamp: string;
  status: 'pending' | 'confirmed';
}

export interface RaffleConfig {
  totalTickets: 100 | 200 | 300 | 500 | 1000;
  prizes: Prize[];
  payment: PaymentConfig;
  price: PriceConfig;
  activePaymentMethods: PaymentMethod[];
}

interface RaffleState {
  config: RaffleConfig;
  purchases: Purchase[];
  soldNumbers: number[];
  reservedNumbers: { number: number; expiresAt: number }[];
  cart: number[];
  adminLoggedIn: boolean;
  currentPage: 'home' | 'admin' | 'registry';

  // Actions
  setConfig: (config: Partial<RaffleConfig>) => void;
  setPrize: (index: number, prize: Partial<Prize>) => void;
  addToCart: (number: number) => void;
  removeFromCart: (number: number) => void;
  clearCart: () => void;
  submitPurchase: (buyerName: string, buyerPhone: string, paymentMethod: PaymentMethod) => Purchase;
  confirmPurchase: (id: string) => void;
  deletePurchase: (id: string) => void;
  setAdminLoggedIn: (v: boolean) => void;
  setCurrentPage: (page: 'home' | 'admin' | 'registry') => void;
  cleanExpiredReservations: () => void;
  isNumberAvailable: (number: number) => boolean;
}

const defaultConfig: RaffleConfig = {
  totalTickets: 100,
  prizes: [
    { id: 1, name: '1° Premio', description: '', photo: null, enabled: true },
    { id: 2, name: '2° Premio', description: '', photo: null, enabled: true },
    { id: 3, name: '3° Premio', description: '', photo: null, enabled: false },
    { id: 4, name: 'Premio Opcional 1', description: '', photo: null, enabled: false },
    { id: 5, name: 'Premio Opcional 2', description: '', photo: null, enabled: false },
  ],
  payment: {
    alias1: 'COOPERADORA.ESC7',
    alias2: '',
    alias2QR: null,
    alias2CBU: '',
    alias3: '',
    alias3QR: null,
    alias3CBU: '',
  },
  price: {
    singlePrice: 1000,
    doublePrice: 1800,
    doubleEnabled: true,
  },
  activePaymentMethods: ['alias1'],
};

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      purchases: [],
      soldNumbers: [],
      reservedNumbers: [],
      cart: [],
      adminLoggedIn: false,
      currentPage: 'home',

      setConfig: (config) =>
        set((state) => ({ config: { ...state.config, ...config } })),

      setPrize: (index, prize) =>
        set((state) => {
          const prizes = [...state.config.prizes];
          prizes[index] = { ...prizes[index], ...prize };
          return { config: { ...state.config, prizes } };
        }),

      addToCart: (number) =>
        set((state) => {
          if (state.cart.includes(number)) return state;
          const RESERVATION_DURATION = 15 * 60 * 1000; // 15 minutes
          const newReservation = {
            number,
            expiresAt: Date.now() + RESERVATION_DURATION,
          };
          return {
            cart: [...state.cart, number],
            reservedNumbers: [...state.reservedNumbers, newReservation],
          };
        }),

      removeFromCart: (number) =>
        set((state) => ({
          cart: state.cart.filter((n) => n !== number),
          reservedNumbers: state.reservedNumbers.filter((r) => r.number !== number),
        })),

      clearCart: () =>
        set((state) => ({
          cart: [],
          reservedNumbers: state.reservedNumbers.filter(
            (r) => !state.cart.includes(r.number)
          ),
        })),

      submitPurchase: (buyerName, buyerPhone, paymentMethod) => {
        const state = get();
        const purchase: Purchase = {
          id: `PUR-${Date.now()}`,
          numbers: [...state.cart],
          buyerName,
          buyerPhone,
          paymentMethod,
          timestamp: new Date().toISOString(),
          status: 'pending',
        };
        set((s) => ({
          purchases: [...s.purchases, purchase],
          soldNumbers: [...s.soldNumbers, ...s.cart],
          cart: [],
          reservedNumbers: s.reservedNumbers.filter((r) => !s.cart.includes(r.number)),
        }));
        return purchase;
      },

      confirmPurchase: (id) =>
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, status: 'confirmed' } : p
          ),
        })),

      deletePurchase: (id) =>
        set((state) => {
          const purchase = state.purchases.find((p) => p.id === id);
          if (!purchase) return state;
          return {
            purchases: state.purchases.filter((p) => p.id !== id),
            soldNumbers: state.soldNumbers.filter((n) => !purchase.numbers.includes(n)),
          };
        }),

      setAdminLoggedIn: (v) => set({ adminLoggedIn: v }),
      setCurrentPage: (page) => set({ currentPage: page }),

      cleanExpiredReservations: () =>
        set((state) => {
          const now = Date.now();
          const expired = state.reservedNumbers
            .filter((r) => r.expiresAt < now)
            .map((r) => r.number);
          return {
            reservedNumbers: state.reservedNumbers.filter((r) => r.expiresAt >= now),
            cart: state.cart.filter((n) => !expired.includes(n)),
          };
        }),

      isNumberAvailable: (number) => {
        const state = get();
        const now = Date.now();
        const isSold = state.soldNumbers.includes(number);
        const isReserved = state.reservedNumbers.some(
          (r) => r.number === number && r.expiresAt > now && !state.cart.includes(number)
        );
        const inCart = state.cart.includes(number);
        return !isSold && !isReserved && !inCart;
      },
    }),
    {
      name: 'raffle-storage',
    }
  )
);
