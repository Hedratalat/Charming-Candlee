import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="font-body bg-accent min-h-screen py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] text-primary font-medium tracking-[0.14em] uppercase mb-2">
                Your Order
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
                Cart
                {cartCount > 0 && (
                  <span className="ml-3 text-[18px] sm:text-[22px] text-primary/50 font-normal">
                    ({cartCount} item{cartCount !== 1 ? "s" : ""})
                  </span>
                )}
              </h2>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[12px] text-primary/60 underline cursor-pointer hover:text-primary transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Empty State */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div
                onClick={() => navigate("/products")}
                className="relative mb-6 cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-full blur-2xl bg-[#936137]/30 animate-pulse" />
                <svg
                  viewBox="0 0 24 24"
                  className="w-16 h-16 relative group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="#936137"
                  strokeWidth="1.6"
                >
                  <path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H6" />
                  <circle cx="10" cy="20" r="1.5" fill="#936137" />
                  <circle cx="18" cy="20" r="1.5" fill="#936137" />
                </svg>
              </div>
              <p
                onClick={() => navigate("/products")}
                className="font-heading text-xl text-dark font-bold mb-1 cursor-pointer hover:text-primary transition-colors duration-200"
              >
                Your cart is empty
              </p>
              <p
                onClick={() => navigate("/products")}
                className="text-[13px] text-primary/60 cursor-pointer hover:text-primary transition-colors duration-200"
              >
                Add some candles to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Items */}
              {cart.map((item) => (
                <div
                  key={item.cartKey}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 bg-secondary border border-border
                    rounded-[20px] p-4 shadow-[0_2px_8px_rgba(61,31,10,0.06)]"
                >
                  {/* Image + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-[#F5E8D8]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-dark truncate">
                        {item.name}
                      </h3>
                      <p className="text-[12px] text-primary/60 mt-0.5 truncate">
                        {item.selectedScents && item.selectedScents.length > 0
                          ? `🌿 ${item.selectedScents.join(" · ")}`
                          : item.scent}
                      </p>
                      <p className="font-heading text-[18px] font-bold text-primary mt-1">
                        {item.price} EGP
                      </p>
                    </div>
                  </div>

                  {/* Controls + Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end sm:gap-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg border border-border bg-accent flex items-center
                          justify-center text-dark text-lg font-medium cursor-pointer
                          hover:bg-primary hover:text-accent hover:border-primary transition-all duration-200"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-heading text-[15px] font-bold text-dark">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg border border-border bg-accent flex items-center
                          justify-center text-dark text-lg font-medium cursor-pointer
                          hover:bg-primary hover:text-accent hover:border-primary transition-all duration-200"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right shrink-0 w-24">
                      <p className="text-[15px] font-bold text-primary tabular-nums">
                        {item.price * item.quantity} EGP
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartKey)}
                        className="text-[11px] text-primary/50 underline cursor-pointer
                          hover:text-primary transition-colors mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div
                className="mt-4 bg-secondary border border-border rounded-[20px] p-5 sm:p-6
                shadow-[0_2px_8px_rgba(61,31,10,0.06)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-primary/70">Subtotal</span>
                  <span className="text-[13px] text-primary/70 tabular-nums">
                    {cartTotal} EGP
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-primary/70">Shipping</span>
                  <span className="text-[13px] text-primary/70">
                    Calculated at checkout
                  </span>
                </div>
                <div className="h-px bg-border mb-4" />
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[20px] text-primary">Total</span>
                  <span className="text-[20px] text-primary tabular-nums">
                    {cartTotal} EGP
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-primary text-accent font-semibold text-[14px]
                  py-4 rounded-xl cursor-pointer hover:bg-[#7a5030] transition-colors
                  tracking-[0.02em] active:scale-[0.99]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
