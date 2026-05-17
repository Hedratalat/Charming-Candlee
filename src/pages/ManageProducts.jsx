import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

function normalizeCategory(str) {
  if (!str.trim()) return "";
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium animate-toast-in ${isSuccess ? "bg-primary text-accent" : "bg-dark text-accent"}`}
    >
      <span className="text-lg">{isSuccess ? "🕯️" : "❌"}</span>
      {toast.message}
    </div>
  );
}

// ── Confirm Delete Popup ───────────────────────────────────────────────────────
function ConfirmPopup({ product, onConfirm, onCancel }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 px-4">
      <div className="bg-white rounded-[24px] border border-border shadow-xl p-8 max-w-sm w-full text-center">
        <span className="text-4xl mb-4 block">🗑️</span>
        <p className="font-heading text-xl font-bold text-dark mb-2">
          Delete Product?
        </p>
        <p className="text-[13px] text-primary/60 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-dark">"{product.name}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border text-dark text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────
function EditModal({ product, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ ...product });
  const [scents, setScents] = useState(
    product.scent ? product.scent.split(" · ") : [],
  );
  const [scentInput, setScentInput] = useState("");

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addScent() {
    const trimmed = scentInput.trim();
    if (!trimmed || scents.includes(trimmed)) return;
    setScents((prev) => [...prev, trimmed]);
    setScentInput("");
  }

  function removeScent(s) {
    setScents((prev) => prev.filter((x) => x !== s));
  }

  function handleScentKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addScent();
    }
  }

  function handleSave() {
    const price = Number(form.price);
    onSave({
      ...form,
      price,
      category: normalizeCategory(form.category),
      scent: scents.join(" · "),
      order: form.order ? Number(form.order) : 9999,
      price_range:
        price < 300 ? "under-300" : price <= 400 ? "300-400" : "above-400",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-[24px] border border-border shadow-xl p-7 sm:p-10 w-full max-w-2xl space-y-6 my-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-dark">
            Edit Product
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent text-primary/50 hover:text-dark transition-all cursor-pointer"
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
        </div>

        {/* Name + Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Product Name" required>
            <Input
              placeholder="e.g. Amber & Oud"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
            />
          </Field>
          <Field label="Subtitle">
            <Input
              placeholder="e.g. Luxury Scented Candle"
              value={form.subtitle || ""}
              onChange={(v) => handleChange("subtitle", v)}
            />
          </Field>
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Price (EGP)" required>
            <Input
              type="number"
              placeholder="e.g. 349"
              value={form.price}
              onChange={(v) => handleChange("price", v)}
            />
          </Field>
          <Field label="Category" required>
            <Input
              placeholder="e.g. Floral"
              value={form.category}
              onChange={(v) => handleChange("category", v)}
            />
          </Field>
        </div>

        {/* Scents */}
        <Field label="Scents">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={scentInput}
                onChange={(e) => setScentInput(e.target.value)}
                onKeyDown={handleScentKey}
                placeholder="e.g. Oud, Amber…"
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={addScent}
                className="px-4 py-2.5 rounded-xl bg-primary text-accent text-sm font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            {scents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {scents.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 bg-accent border border-border text-dark text-[12px] font-medium px-3 py-1 rounded-full"
                  >
                    🌿 {s}
                    <button
                      type="button"
                      onClick={() => removeScent(s)}
                      className="text-primary/60 hover:text-primary cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            rows={3}
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe the candle…"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </Field>

        {/* Image */}
        <Field label="Image URL">
          <Input
            placeholder="https://…"
            value={form.image || ""}
            onChange={(v) => handleChange("image", v)}
          />
          {form.image && (
            <div className="mt-2 rounded-xl overflow-hidden h-28 border border-border">
              <img
                src={form.image}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </Field>

        {/* Order + BestSeller + InStock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
          <Field label="Display Order">
            <Input
              type="number"
              placeholder="e.g. 1"
              value={form.order === 9999 ? "" : form.order || ""}
              onChange={(v) => handleChange("order", v)}
            />
          </Field>
          <div className="flex items-center gap-3 pb-1">
            <button
              type="button"
              onClick={() => handleChange("bestSeller", !form.bestSeller)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${form.bestSeller ? "bg-primary" : "bg-border"}`}
            >
              <span
                className={`absolute top-[4px] left-[4px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${form.bestSeller ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className="text-sm font-medium text-dark">
              {form.bestSeller ? "⭐ Best Seller" : "Best Seller"}
            </span>
          </div>
          <div className="flex items-center gap-3 pb-1">
            <button
              type="button"
              onClick={() => handleChange("inStock", !form.inStock)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${form.inStock ? "bg-primary" : "bg-border"}`}
            >
              <span
                className={`absolute top-[4px] left-[4px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${form.inStock ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className="text-sm font-medium text-dark">
              {form.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border text-dark text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-7 py-2.5 rounded-xl bg-primary text-accent text-sm font-semibold hover:bg-dark transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(data.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)));
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  async function handleSave(updated) {
    setSaving(true);
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, "products", id), data);
      setProducts((prev) =>
        prev
          .map((p) => (p.id === id ? { ...p, ...data } : p))
          .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
      );
      setEditProduct(null);
      showToast("Product updated successfully");
    } catch {
      showToast("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteProduct) return;
    try {
      await deleteDoc(doc(db, "products", deleteProduct.id));
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      showToast("Product deleted");
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setDeleteProduct(null);
    }
  }

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-accent py-10 px-4 sm:px-8 font-body">
      <Toast toast={toast} />
      {editProduct && (
        <EditModal
          product={editProduct}
          onSave={handleSave}
          onCancel={() => setEditProduct(null)}
          loading={saving}
        />
      )}
      <ConfirmPopup
        product={deleteProduct}
        onConfirm={handleDelete}
        onCancel={() => setDeleteProduct(null)}
      />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] text-primary font-semibold tracking-[0.16em] uppercase mb-1">
            Dashboard
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
            Manage Products
          </h1>
          <p className="text-sm text-primary/60 mt-1">
            {products.length} products total
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40"
            viewBox="0 0 20 20"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white text-dark placeholder:text-primary/30 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-24">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <span className="text-5xl mb-4 block">🕯️</span>
          <p className="font-heading text-xl font-bold text-dark">
            No products found
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-[20px] border border-border shadow-[0_2px_16px_rgba(147,97,55,0.07)] overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 bg-gradient-to-br from-primary/8 to-primary/3">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-20">🕯️</span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.bestSeller && (
                    <span className="bg-primary text-accent text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ⭐ Best Seller
                    </span>
                  )}
                  {!p.inStock && (
                    <span className="bg-dark text-accent text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                {p.order && p.order !== 9999 && (
                  <span className="absolute top-3 right-3 bg-white/90 text-dark text-[10px] font-bold px-2 py-1 rounded-full border border-border">
                    #{p.order}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-2 flex-1">
                <div>
                  <p className="font-heading text-[16px] font-bold text-dark leading-tight">
                    {p.name}
                  </p>
                  {p.subtitle && (
                    <p className="text-[12px] text-primary/50 mt-0.5">
                      {p.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-primary">
                    {p.price} EGP
                  </span>
                  <span className="text-[11px] bg-accent border border-border text-dark px-2.5 py-1 rounded-full">
                    {p.category}
                  </span>
                </div>
                {p.scent && (
                  <p className="text-[11px] text-primary/50 truncate">
                    🌿 {p.scent}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setEditProduct(p)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-dark text-[13px] font-medium hover:bg-accent hover:border-primary/40 transition-all cursor-pointer"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setDeleteProduct(p)}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-[13px] font-medium hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text", hasError }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors ${hasError ? "border-red-400" : "border-border"}`}
    />
  );
}
