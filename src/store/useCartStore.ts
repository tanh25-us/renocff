import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

function calcTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}

export const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  totalItems: 0,
  totalPrice: 0,

  addToCart: (item) =>
    set((state) => {
      const existing = state.cartItems.find((c) => c.id === item.id);
      const cartItems = existing
        ? state.cartItems.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...state.cartItems, { ...item, quantity: 1 }];
      return { cartItems, ...calcTotals(cartItems) };
    }),

  removeFromCart: (id) =>
    set((state) => {
      const cartItems = state.cartItems.filter((c) => c.id !== id);
      return { cartItems, ...calcTotals(cartItems) };
    }),

  updateQuantity: (id, delta) =>
    set((state) => {
      const cartItems = state.cartItems
        .map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0);
      return { cartItems, ...calcTotals(cartItems) };
    }),

  clearCart: () => set({ cartItems: [], totalItems: 0, totalPrice: 0 }),
}));
