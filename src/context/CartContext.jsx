import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CartContext = createContext();

const CART_KEY = "Charming_cart";
const FAV_KEY = "Charming_favorites";

export function CartProvider({ children }) {
  const { showToast } = useToast();

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch {
      return [];
    }
  });

  // ── Sync to localStorage ──
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // ── Cart Actions ──
  function addToCart(product) {
    setCart((prev) => {
      const selectedKey = (product.selectedScents ?? [])
        .slice()
        .sort()
        .join(",");
      const newScents = new Set(product.selectedScents ?? []);
      const conflict = prev.find(
        (item) =>
          item.id === product.id &&
          (item.selectedScents ?? []).some((s) => newScents.has(s)),
      );
      if (conflict) {
        showToast({
          message: "One of these scents is already in cart",
          type: "warning",
        });
        return prev;
      }
      showToast({ message: "Added to cart", type: "success" });
      const cartKey = `${product.id}_${selectedKey}`;
      return [...prev, { ...product, cartKey, quantity: 1 }];
    });
  }

  function removeFromCart(cartKey) {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
    showToast({ message: "Removed from cart", type: "remove" });
  }

  function updateQuantity(cartKey, quantity) {
    if (quantity < 1) return removeFromCart(cartKey);
    setCart((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item,
      ),
    );
  }

  function clearCart() {
    setCart([]);
  }

  // ── Favorites Actions ──
  function toggleFav(product) {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        showToast({ message: "Removed from favorites", type: "remove" });
        return prev.filter((item) => item.id !== product.id);
      }
      showToast({ message: "Added to favorites", type: "fav" });
      return [...prev, product];
    });
  }

  function removeFromFav(productId) {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
    showToast({ message: "Removed from favorites", type: "remove" });
  }

  // ── Computed ──
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favCount = favorites.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleFav,
        removeFromFav,
        cartTotal,
        cartCount,
        favCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
