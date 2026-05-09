import { useState } from "react";
import { useCart } from "../../context/CartContext";

// ── Popup Modal ────────────────────────────────────────────────────────────────
function ProductModal({ product, onClose }) {
  const { addToCart, cart } = useCart();
  const isInCart = cart.some((item) => item.id === product.id);
  const [selectedScents, setSelectedScents] = useState([]);

  const scents = product.scent
    ? product.scent.split(" · ").map((s) => s.trim())
    : [];

  function toggleScent(s) {
    setSelectedScents((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function handleAddToCart() {
    addToCart({ ...product, selectedScents });
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-dark/50 z-50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-secondary rounded-[24px] border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Image */}
          <div className="relative h-[240px] overflow-hidden rounded-t-[24px] bg-[#F5E8D8] shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {!product.inStock && (
              <div className="absolute top-3 left-3 bg-dark/70 text-accent text-[10px] font-medium px-2.5 py-1 rounded-full">
                Out of Stock
              </div>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark/50 text-accent flex items-center justify-center hover:bg-dark transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Tags row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-primary/70 font-medium bg-accent border border-border px-2 py-0.5 rounded-full">
                {product.category}
              </span>
              {product.size && (
                <span className="text-[10px] text-primary/70 font-medium bg-accent border border-border px-2 py-0.5 rounded-full">
                  {product.size}
                </span>
              )}
            </div>

            {/* Name + subtitle */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-dark leading-tight">
                {product.name}
              </h2>
              <p className="text-[13px] text-primary font-normal mt-0.5">
                {product.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#5a3a20] leading-[1.7] opacity-80">
              {product.description}
            </p>

            {/* Scents selection */}
            {scents.length > 0 && (
              <div>
                <div className="h-px bg-border mb-4" />
                <p className="text-[11px] text-primary font-semibold tracking-[0.12em] uppercase mb-3">
                  Scents — pick your favourites
                </p>
                <div className="flex flex-wrap gap-2">
                  {scents.map((s) => {
                    const active = selectedScents.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleScent(s)}
                        className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-primary text-accent border-primary"
                            : "bg-accent text-dark border-border hover:border-primary"
                        }`}
                      >
                        🌿 {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom */}
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between pt-1">
              <span className="font-heading text-2xl font-bold text-primary">
                {product.price} EGP
              </span>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex items-center gap-1.5 px-5 py-[11px] rounded-xl text-[13px] font-semibold
                  text-accent border-none tracking-[0.02em] transition-all duration-300 active:scale-95 ${
                    !product.inStock
                      ? "bg-primary/40 cursor-not-allowed"
                      : isInCart
                        ? "bg-dark cursor-pointer"
                        : "bg-primary hover:bg-[#7a5030] cursor-pointer"
                  }`}
              >
                {!product.inStock ? (
                  "Out of Stock"
                ) : isInCart ? (
                  <>
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="#FFF8F0"
                      strokeWidth="2"
                    >
                      <path d="M2 8l4 4 8-8" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="#FFF8F0"
                      strokeWidth="1.6"
                    >
                      <path d="M1.5 1.5h2l1.8 8.5h7.4l1.3-5.5H4.5" />
                      <circle cx="7" cy="13.5" r="1" fill="#FFF8F0" />
                      <circle cx="11" cy="13.5" r="1" fill="#FFF8F0" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { addToCart, toggleFav, favorites, cart } = useCart();
  const isFav = favorites.some((f) => f.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {modalOpen && (
        <ProductModal product={product} onClose={() => setModalOpen(false)} />
      )}

      <div
        onClick={() => setModalOpen(true)}
        className="h-full w-full flex flex-col bg-secondary rounded-[20px] overflow-hidden border
         border-border shadow-[0_2px_8px_rgba(61,31,10,0.06),0_12px_40px_rgba(147,97,55,0.12)] transition-all 
         duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(61,31,10,0.1),0_24px_60px_rgba(147,97,55,0.18)] cursor-pointer"
      >
        {/* ── Image Area ── */}
        <div className="relative h-[280px] overflow-hidden bg-[#F5E8D8] shrink-0">
          {/* Favourite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(product);
            }}
            className="absolute bottom-[14px] right-[14px] z-10 w-9 h-9 rounded-full border
             border-border bg-accent/90 backdrop-blur-sm flex items-center justify-center cursor-pointer
              transition-transform duration-200 hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill={isFav ? "#936137" : "none"}
              stroke="#936137"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          {!product.inStock && (
            <div className="absolute top-3 left-3 z-10 bg-dark/70 text-accent text-[10px] font-medium px-2.5 py-1 rounded-full">
              Out of Stock
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover block transition-opacity duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex-1">
            {/* Category + Size + icon */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-primary/70 font-medium bg-accent border border-border px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                {product.size && (
                  <span className="text-[10px] text-primary/70 font-medium bg-accent border border-border px-2 py-0.5 rounded-full">
                    {product.size}
                  </span>
                )}
              </div>
              <span className="text-[16px] [filter:drop-shadow(0_0_4px_rgba(147,97,55,0.5))] animate-flicker">
                🕯️
              </span>
            </div>

            {/* Name + subtitle */}
            <div className="mb-3">
              <h2 className="font-heading text-[22px] font-bold text-dark leading-tight m-0">
                {product.name}
              </h2>
              <p className="text-[13px] text-primary font-normal mt-0.5">
                {product.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#5a3a20] leading-[1.7] mb-3.5 opacity-80 line-clamp-3">
              {product.description}
            </p>
          </div>

          {/* Bottom */}
          <div>
            <div className="h-px bg-border mb-4" />
            <div className="flex items-center justify-between">
              <span className="font-heading text-2xl font-bold text-primary">
                {product.price} EGP
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                disabled={!product.inStock}
                className={`flex items-center gap-1.5 px-5 py-[11px] rounded-xl text-[13px] font-semibold
                  text-accent border-none tracking-[0.02em] transition-all duration-300 active:scale-95 ${
                    !product.inStock
                      ? "bg-primary/40 cursor-not-allowed"
                      : isInCart
                        ? "bg-dark cursor-pointer"
                        : "bg-primary hover:bg-[#7a5030] cursor-pointer"
                  }`}
              >
                {!product.inStock ? (
                  "Out of Stock"
                ) : isInCart ? (
                  <>
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="#FFF8F0"
                      strokeWidth="2"
                    >
                      <path d="M2 8l4 4 8-8" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="#FFF8F0"
                      strokeWidth="1.6"
                    >
                      <path d="M1.5 1.5h2l1.8 8.5h7.4l1.3-5.5H4.5" />
                      <circle cx="7" cy="13.5" r="1" fill="#FFF8F0" />
                      <circle cx="11" cy="13.5" r="1" fill="#FFF8F0" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
