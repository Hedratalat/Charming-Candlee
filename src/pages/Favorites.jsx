import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ProductCard from "../components/ProductCard/ProductCard";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const { favorites, removeFromFav } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="font-body bg-accent min-h-screen py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] text-primary font-medium tracking-[0.14em] uppercase mb-2">
              Your Collection
            </p>
            <h2 className="font-heading text-4xl font-bold text-dark">
              Favorites
              {favorites.length > 0 && (
                <span className="ml-3 text-[22px] text-primary/50 font-normal">
                  ({favorites.length})
                </span>
              )}
            </h2>
          </div>

          {/* Empty State */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              {/* Heart Container */}
              <div
                onClick={() => navigate("/products")}
                className="relative mb-6 cursor-pointer group"
              >
                {/* Glow */}
                <div className="absolute inset-0 rounded-full blur-2xl bg-[#936137]/30 animate-pulse"></div>

                {/* Heart */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-16 h-16 relative animate-float group-hover:scale-110 transition-transform duration-300"
                  fill="#936137"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
          2 6 4 4 6.5 4c1.74 0 3.41 1.01 
          4.22 2.53C11.09 5.01 12.76 4 
          14.5 4 17 4 19 6 19 8.5c0 
          3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>

              {/* Text */}
              <p
                onClick={() => navigate("/products")}
                className="font-heading text-xl text-dark font-bold mb-1 cursor-pointer
                 hover:text-primary transition-colors duration-200"
              >
                No favorites yet
              </p>

              <p
                onClick={() => navigate("/products")}
                className="text-[15px] text-primary/60 cursor-pointer hover:text-primary transition-colors duration-200"
              >
                Click the heart to explore products
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              {favorites.map((product) => (
                <div key={product.id} className="relative group h-full">
                  <ProductCard product={product} />

                  {/* Remove button overlay */}
                  <button
                    onClick={() => removeFromFav(product.id)}
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 bg-dark/70 text-accent text-[11px]
                      font-medium px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
