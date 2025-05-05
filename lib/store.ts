import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, SortOption, CartItem } from './types';
import { v4 as uuidv4 } from 'uuid';

interface ProductStore {
  filters: FilterState;
  sort: SortOption;
  selectedOption1: string | null;
  selectedOption2: string | null;
  selectedQuantity: number;
  cart: CartItem[];
  sessionId: string | null;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setSort: (sort: SortOption) => void;
  setSelectedOption1: (option1: string | null) => void;
  setSelectedOption2: (option2: string | null) => void;
  setSelectedQuantity: (quantity: number) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  setSessionId: (sessionId: string | null) => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      filters: {
        colors: [],
        sizes: [],
        vendors: [],
        priceRange: [0, 10000000],
      },
      sort: 'price-asc',
      selectedOption1: null,
      selectedOption2: null,
      selectedQuantity: 1,
      cart: [],
      sessionId: uuidv4(), // Initialize session_id for guests
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
      setSort: (sort) => set({ sort }),
      setSelectedOption1: (option1) => set({ selectedOption1: option1 }),
      setSelectedOption2: (option2) => set({ selectedOption2: option2 }),
      setSelectedQuantity: (quantity) => set({ selectedQuantity: Math.max(1, quantity) }),
      addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
      removeFromCart: (cartItemId) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== cartItemId) })),
      setSessionId: (sessionId) => set({ sessionId }),
      resetFilters: () =>
        set({
          filters: {
            colors: [],
            sizes: [],
            vendors: [],
            priceRange: [0, 10000000],
          },
        }),
    }),
    {
      name: 'product-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);