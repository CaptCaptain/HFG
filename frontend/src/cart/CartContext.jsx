import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

const STORAGE_KEYS = {
  cart: "cart",
  orders: "orders",
  library: "library",
};

function generateKey() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.cart);
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.orders);
    return saved ? JSON.parse(saved) : [];
  });

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.library);
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const updateCart = (nextCart) => {
    setCart(nextCart);
    persist(STORAGE_KEYS.cart, nextCart);
  };

  const updateOrders = (nextOrders) => {
    setOrders(nextOrders);
    persist(STORAGE_KEYS.orders, nextOrders);
  };

  const updateLibrary = (nextLibrary) => {
    setLibrary(nextLibrary);
    persist(STORAGE_KEYS.library, nextLibrary);
  };

  // Clear cart, orders, and library when the user signs out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setCart([]);
        setOrders([]);
        setLibrary([]);
        localStorage.removeItem(STORAGE_KEYS.cart);
        localStorage.removeItem(STORAGE_KEYS.orders);
        localStorage.removeItem(STORAGE_KEYS.library);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.name === product.name);

    const updated = existing
      ? cart.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, quantity: 1 }];

    updateCart(updated);
  };

  const removeFromCart = (name) => {
    const updated = cart.filter((item) => item.name !== name);
    updateCart(updated);
  };

  const increaseQty = (name) => {
    const updated = cart.map((item) =>
      item.name === name
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(updated);
  };

  const decreaseQty = (name) => {
    const updated = cart
      .map((item) =>
        item.name === name
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const checkoutCart = () => {
    if (cart.length === 0) {
      return null;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: cart,
      total,
      status: "Completed",
    };

    const nextOrders = [order, ...orders];

    const nextLibrary = cart.reduce((acc, item) => {
      const existing = acc.find((game) => game.name === item.name);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({
          id: `LIB-${item.name}-${Date.now()}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          activationKey: generateKey(),
          downloadUrl: `#/download/${slugify(item.name)}`,
          purchasedAt: new Date().toLocaleDateString(),
        });
      }
      return acc;
    }, [...library]);

    updateOrders(nextOrders);
    updateLibrary(nextLibrary);
    updateCart([]);

    return order;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        orders,
        library,
        checkoutCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;