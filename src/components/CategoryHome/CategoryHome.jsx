import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CategoryHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 3;
  const visibleCategories = showAll
    ? categories
    : categories.slice(0, INITIAL_COUNT);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const counts = {};
        const images = {};

        snap.forEach((doc) => {
          const data = doc.data();
          const cat = data.category;
          if (!cat) return;
          counts[cat] = (counts[cat] || 0) + 1;
          if (!images[cat] && data.image) images[cat] = data.image;
        });

        const list = Object.entries(counts).map(([name, count]) => ({
          name,
          count,
          image: images[name] || null,
        }));

        setCategories(list.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="font-body bg-accent ">
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-14 pb-10 text-center">
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-dark leading-tight">
          Shop by Category
        </h2>
        <p className="mt-3 text-[14px] text-primary/50 max-w-md mx-auto">
          Explore our handcrafted scented candle collections, sorted by style
          and mood.
        </p>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pb-14">
        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-5xl mb-4">🕯️</span>
            <p className="font-heading text-xl text-dark font-bold mb-1">
              No categories found
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCategories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  navigate(
                    `/products?category=${encodeURIComponent(cat.name)}`,
                  );
                }}
                className="group relative overflow-hidden rounded-[22px] border border-border cursor-pointer hover:border-primary/40 hover:shadow-xl transition-all duration-300 h-56"
              >
                {/* Image */}
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-7xl opacity-20">🕯️</span>
                  </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/20 to-transparent" />

                {/* Info on top of image */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                  <div className="text-left">
                    <p className="font-heading text-[19px] font-bold text-accent leading-tight">
                      {cat.name}
                    </p>
                    <p className="text-[12px] text-accent/60 mt-0.5">
                      {cat.count} {cat.count === 1 ? "candle" : "candles"}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="w-9 h-9 rounded-full border border-accent/30 flex items-center justify-center text-accent/60 group-hover:bg-primary group-hover:border-primary group-hover:text-accent transition-all duration-300 shrink-0">
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}{" "}
            {!showAll && categories.length > INITIAL_COUNT && (
              <div className="col-span-full flex justify-center mt-4">
                <button
                  onClick={() => setShowAll(true)}
                  className="px-6 py-2.5 rounded-xl border border-border text-[13px] font-medium text-dark hover:bg-white hover:border-primary/40 transition-all duration-200 cursor-pointer"
                >
                  Show More ({categories.length - INITIAL_COUNT} more)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
