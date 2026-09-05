import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const taxRate = 0.08; // 8% sales tax

  const addToCart = (product, qty = 1) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQty = existingItem.quantity + qty;
        
        if (newQty > product.stock_qty) {
          alert(`Cannot add more "${product.name}". Max stock available is ${product.stock_qty}.`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty
        };
        return updated;
      } else {
        if (qty > product.stock_qty) {
          alert(`Cannot add "${product.name}". Max stock available is ${product.stock_qty}.`);
          return prevItems;
        }
        return [...prevItems, { product, quantity: qty }];
      }
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.product.id === productId) {
          if (newQty > item.product.stock_qty) {
            alert(`Stock limit reached! Max available: ${item.product.stock_qty}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountPercent(0);
    setCustomerName('Walk-in Customer');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const taxAmount = useMemo(() => {
    return taxableAmount * taxRate;
  }, [taxableAmount]);

  const grandTotal = useMemo(() => {
    return Math.max(0, taxableAmount + taxAmount);
  }, [taxableAmount, taxAmount]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        discountPercent,
        setDiscountPercent,
        customerName,
        setCustomerName,
        subtotal,
        discountAmount,
        taxAmount,
        taxRate,
        grandTotal,
        totalItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
