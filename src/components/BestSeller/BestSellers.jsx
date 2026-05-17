import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../ProductCard/ProductCard";

const INITIAL_COUNT = 6;

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const visibleProducts = showAll ? products : products.slice(0, INITIAL_COUNT);

  useEffect(() => {
    async function fetchBestSellers() {
      try {
        const q = query(
          collection(db, "products"),
          where("bestSeller", "==", true),
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setProducts(list);
      } catch (err) {
        console.error("Failed to fetch best sellers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBestSellers();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="font-body bg-accent py-14 px-6 lg:px-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-dark leading-tight">
          Best Sellers
        </h2>
        <p className="mt-3 text-[14px] text-primary/50 max-w-md mx-auto">
          Our most-loved scented candles, chosen by you.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {visibleProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="h-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Show More */}
        {!showAll && products.length > INITIAL_COUNT && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2.5 rounded-xl border border-border text-[13px] font-medium text-dark hover:bg-white hover:border-primary/40 transition-all duration-200 cursor-pointer"
            >
              Show More ({products.length - INITIAL_COUNT} more)
            </button>
          </div>
        )}

        {/* View All */}
        {showAll && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/products?category=all");
              }}
              className="px-6 py-2.5 rounded-xl bg-primary text-accent text-[13px] font-semibold hover:bg-dark transition-colors cursor-pointer"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
