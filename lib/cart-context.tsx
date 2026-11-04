'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PRODUCTS, PHONE_NUMBERS } from './data';

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getPhoneNumber: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Hidratar desde localStorage. Un valor corrupto no debe tumbar la app entera.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? (JSON.parse(saved) as unknown) : [];
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (item): item is CartItem =>
              !!item &&
              typeof item.productId === 'string' &&
              typeof item.quantity === 'number' &&
              item.quantity > 0
          )
        );
      }
    } catch {
      localStorage.removeItem('cart');
    }
    setMounted(true);
  }, []);

  // Guardar en localStorage cuando cambien los items
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getPhoneNumber = () => {
    const total = getTotalItems();
    if (total <= 10) {
      return PHONE_NUMBERS.tier1;
    } else if (total <= 50) {
      return PHONE_NUMBERS.tier2;
    } else {
      return PHONE_NUMBERS.tier3;
    }
  };

  const addItem = (productId: string) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.productId === productId);
      if (existing) {
        return prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { productId, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getPhoneNumber }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
