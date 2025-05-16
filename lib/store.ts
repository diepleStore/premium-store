import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '@/lib/types';

interface ProductStore {
  sessionId: string;
  cart: CartItem[];
  setSessionId: (id: string) => void;
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  clearCart: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      sessionId: uuidv4(),
      cart: [],
      setSessionId: (id) => set({ sessionId: id }),
      setCart: (cart) =>
        set((state) => ({
          cart: typeof cart === 'function' ? cart(state.cart) : cart,
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'product-store',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);

// Initialize sessionId if not set
if (typeof window !== 'undefined') {
  const { sessionId, setSessionId } = useProductStore.getState();
  if (!sessionId) {
    setSessionId(uuidv4());
  }
}