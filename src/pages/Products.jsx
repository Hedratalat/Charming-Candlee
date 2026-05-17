import { useState, useMemo } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProductCard from "../components/ProductCard/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer/Footer";
import { useProducts } from "../hooks/useProducts";
import { useSearchParams } from "react-router-dom";

// ─── Config ────────────────────────────────────────────────────────────────────
const PRODUCTS_PER_PAGE = 6;

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under 300 EGP", value: "under-300" },
  { label: "300 – 400 EGP", value: "300-400" },
  { label: "Above 400 EGP", value: "above-400" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] text-primary font-semibold tracking-[0.14em] uppercase mb-3">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FilterOption({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-[13px] px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border ${
        active
          ? "bg-primary text-accent border-primary font-medium"
          : "text-dark border-transparent hover:border-border hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function FiltersContent({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  isFiltered,
  resetFilters,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="  font-heading text-[16px] font-bold text-dark">
          Filters
        </span>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-primary underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="h-px bg-border mb-5" />

      <FilterSection title="Category">
        {categories.map((cat) => (
          <FilterOption
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </FilterSection>

      <div className="h-px bg-border mb-5" />

      <FilterSection title="Price Range">
        {priceRanges.map((p) => (
          <FilterOption
            key={p.value}
            label={p.label}
            active={selectedPrice === p.value}
            onClick={() => setSelectedPrice(p.value)}
          />
        ))}
      </FilterSection>

      <div className="h-px bg-border mb-5" />
    </>
  );
}

// ─── Pagination Component ───────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Show max 4 page numbers centered around current page
  const MAX_VISIBLE = 4;
  const getPageNumbers = () => {
    if (totalPages <= MAX_VISIBLE) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 1);
    let end = start + MAX_VISIBLE - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - MAX_VISIBLE + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12 select-none">
      {/* Prev button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200 cursor-pointer ${
          currentPage === 1
            ? "opacity-35 cursor-not-allowed border-transparent text-primary"
            : "border-border text-dark hover:bg-white hover:border-primary/40"
        }`}
      >
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
          <path d="M10 12L6 8l4-4" />
        </svg>
        Prev
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer border ${
              currentPage === page
                ? "bg-primary text-accent border-primary shadow-sm"
                : "text-dark border-transparent hover:border-border hover:bg-white"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200 cursor-pointer ${
          currentPage === totalPages
            ? "opacity-35 cursor-not-allowed border-transparent text-primary"
            : "border-border text-dark hover:bg-white hover:border-primary/40"
        }`}
      >
        Next
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
      </button>
    </div>
  );
}

// ─── Products Page ─────────────────────────────────────────────────────────────
export default function Products() {
  const { products, loading, error } = useProducts();

  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const unique = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    return ["All", ...unique.sort()];
  }, [products]);

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const searchMatch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.scent?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    const categoryMatch =
      selectedCategory === "All" || p.category === selectedCategory;
    const priceMatch =
      selectedPrice === "all" ||
      (selectedPrice === "under-300" && p.price < 300) ||
      (selectedPrice === "300-400" && p.price >= 300 && p.price <= 400) ||
      (selectedPrice === "above-400" && p.price > 400);

    return searchMatch && categoryMatch && priceMatch;
  });

  // ─── Pagination logic ──────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  // Reset to page 1 whenever filters change
  function handleFilterChange(setter) {
    return (value) => {
      setter(value);
      setCurrentPage(1);
    };
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    // Smooth scroll to top of grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFilters() {
    setSelectedCategory("All");
    setSelectedPrice("all");
    setSearchQuery("");
    setCurrentPage(1);
  }

  const isFiltered =
    selectedCategory !== "All" || selectedPrice !== "all" || searchQuery !== "";

  const filterProps = {
    categories,
    selectedCategory,
    setSelectedCategory: handleFilterChange(setSelectedCategory),
    selectedPrice,
    setSelectedPrice: handleFilterChange(setSelectedPrice),
    isFiltered,
    resetFilters,
  };

  return (
    <>
      <Navbar />

      <div className="font-body bg-accent min-h-screen py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] text-primary font-medium tracking-[0.14em] uppercase mb-2">
                Our Collection
              </p>
              <h1 className="font-heading text-4xl font-bold text-dark">
                Scented Candles
              </h1>
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-secondary border border-border text-dark text-[13px] font-medium px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <svg
                viewBox="0 0 20 20"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round" />
              </svg>
              Filters
              {isFiltered && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/50"
              viewBox="0 0 20 20"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13.5 13.5 L17 17" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or scent…"
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-border bg-white text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Layout */}
          <div className="flex gap-10 items-start">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:block w-60 shrink-0 bg-secondary rounded-[20px] border border-border p-6 sticky top-6">
              <FiltersContent {...filterProps} />
            </aside>

            {/* ── Grid ── */}
            <div className="flex-1 min-w-0">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-primary/60">Loading candles…</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="text-4xl mb-4">⚠️</span>
                  <p className="font-heading text-xl text-dark font-bold mb-1">
                    Something went wrong
                  </p>
                  <p className="text-[13px] text-primary/60">
                    Could not load products. Please try again.
                  </p>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="text-4xl mb-4">🕯️</span>
                  <p className="font-heading text-xl text-dark font-bold mb-1">
                    No candles found
                  </p>
                  <p className="text-[13px] text-primary/60 mb-4">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-[13px] text-accent bg-primary px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Grid */}
              {!loading && !error && filtered.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    <AnimatePresence mode="popLayout">
                      {paginatedProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="h-full"
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Sheet Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-dark/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-secondary rounded-t-[24px] p-6 max-h-[80vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              {/* Header with X button */}
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center
                 justify-center rounded-full hover:bg-border/60 text-primary/50 hover:text-dark
                  transition-all cursor-pointer"
              >
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>

              <FiltersContent {...filterProps} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-primary text-accent text-[14px] font-semibold py-3.5 rounded-xl cursor-pointer mt-2"
              >
                Show {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
