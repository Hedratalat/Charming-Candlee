import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ProductCard from "../components/ProductCard/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer/Footer";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const products = [
  {
    id: 1,
    name: "Amber & Oud",
    subtitle: "Luxury Scented Candle",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1528351655744-27cc30462816?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FuZGxlfGVufDB8fDB8fHww",
    burnTime: "55 hrs",
    scent: "Oud · Amber · Musk",
    category: "Oriental",
    price_range: "300-400",
    description:
      "A rich oriental blend of authentic oud and warm amber, crafting an atmosphere of deep calm and timeless elegance.",
    inStock: false,
  },
  {
    id: 2,
    name: "Rose & Vanilla",
    subtitle: "Luxury Scented Candle",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1612293905607-b003de9e54fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2FuZGxlfGVufDB8fDB8fHww",
    burnTime: "45 hrs",
    scent: "Rose · Vanilla · Sandalwood",
    category: "Floral",
    price_range: "under-300",
    description:
      "A soft floral heart wrapped in warm vanilla, perfect for cozy evenings at home.",
    inStock: true,
  },
  {
    id: 3,
    name: "Cedar & Smoke",
    subtitle: "Luxury Scented Candle",
    price: 379,
    image:
      "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=600&q=80",
    burnTime: "60 hrs",
    scent: "Cedar · Smoke · Leather",
    category: "Woody",
    price_range: "300-400",
    description:
      "Bold and grounding — a woody smoke blend that transforms any room into a sanctuary.",
    inStock: true,
  },
];

// ─── Filter Config ─────────────────────────────────────────────────────────────
const categories = ["All", "Floral", "Woody", "Oriental", "Fresh"];
const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under 300 EGP", value: "under-300" },
  { label: "300 – 400 EGP", value: "300-400" },
  { label: "Above 400 EGP", value: "above-400" },
];
const burnTimes = [
  { label: "All", value: "all" },
  { label: "Under 50 hrs", value: "under-50" },
  { label: "50 hrs +", value: "50-plus" },
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

// ─── Shared filter content (used in both sidebar & drawer) ────────────────────
function FiltersContent({
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  selectedBurn,
  setSelectedBurn,
  isFiltered,
  resetFilters,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="font-heading text-[16px] font-bold text-dark">
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

      <FilterSection title="Burn Time">
        {burnTimes.map((b) => (
          <FilterOption
            key={b.value}
            label={b.label}
            active={selectedBurn === b.value}
            onClick={() => setSelectedBurn(b.value)}
          />
        ))}
      </FilterSection>
    </>
  );
}

// ─── Products Page ─────────────────────────────────────────────────────────────
export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedBurn, setSelectedBurn] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const searchMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.scent.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const categoryMatch =
      selectedCategory === "All" || p.category === selectedCategory;
    const priceMatch =
      selectedPrice === "all" ||
      (selectedPrice === "under-300" && p.price < 300) ||
      (selectedPrice === "300-400" && p.price >= 300 && p.price <= 400) ||
      (selectedPrice === "above-400" && p.price > 400);
    const burnMatch =
      selectedBurn === "all" ||
      (selectedBurn === "under-50" && parseInt(p.burnTime) < 50) ||
      (selectedBurn === "50-plus" && parseInt(p.burnTime) >= 50);
    return searchMatch && categoryMatch && priceMatch && burnMatch;
  });

  function resetFilters() {
    setSelectedCategory("All");
    setSelectedPrice("all");
    setSelectedBurn("all");
    setSearchQuery("");
  }

  const isFiltered =
    selectedCategory !== "All" ||
    selectedPrice !== "all" ||
    selectedBurn !== "all" ||
    searchQuery !== "";
  const filterProps = {
    selectedCategory,
    setSelectedCategory,
    selectedPrice,
    setSelectedPrice,
    selectedBurn,
    setSelectedBurn,
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or scent…"
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-border bg-white text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
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
              {filtered.length === 0 ? (
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
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.08 }}
                        className="h-full"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Sheet Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-dark/40 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-secondary rounded-t-[24px] p-6 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

              <FiltersContent {...filterProps} />

              {/* Apply button */}
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
