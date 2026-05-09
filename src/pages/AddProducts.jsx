import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

const EMPTY_FORM = {
  name: "",
  subtitle: "",
  price: "",
  image: "",
  category: "",
  description: "",
  inStock: true,
  size: "",
};

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
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium animate-toast-in
        ${isSuccess ? "bg-primary text-accent" : "bg-dark text-accent"}`}
    >
      <span className="text-lg">{isSuccess ? "🕯️" : "❌"}</span>
      {toast.message}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AddProducts() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [scents, setScents] = useState([]);
  const [scentInput, setScentInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Scent helpers ────────────────────────────────────────────────────────────
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

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Enter a valid price";
    if (!form.category.trim()) e.category = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.image.trim()) e.image = "Required";
    if (scents.length === 0) e.scents = "Add at least one scent";
    return e;
  }

  // ── Submit → Firebase ────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const price = Number(form.price);
    const product = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      price,
      image: form.image.trim(),
      category: normalizeCategory(form.category),
      scent: scents.join(" · "),
      description: form.description.trim(),
      inStock: form.inStock,
      size: form.size.trim() ? `${form.size.trim()}g` : null,
      price_range:
        price < 300 ? "under-300" : price <= 400 ? "300-400" : "above-400",
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "products"), product);
      showToast("Product added successfully", "success");
      setForm(EMPTY_FORM);
      setScents([]);
    } catch (err) {
      console.error(err);
      showToast("Failed to add product. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className="min-h-screen bg-accent py-10 px-4 sm:px-8 font-body">
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-8">
        <p className="text-[11px] text-primary font-semibold tracking-[0.16em] uppercase mb-1">
          Dashboard
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
          Add New Product
        </h1>
        <p className="text-sm text-primary/60 mt-1">
          Fill in the details below to list a new candle.
        </p>
      </div>

      {/* ── Card ── */}
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white rounded-[24px] border border-border shadow-[0_4px_32px_rgba(147,97,55,0.1)] p-7 sm:p-10 space-y-7"
      >
        {/* ── Name + Subtitle ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Product Name" error={errors.name} required>
            <Input
              placeholder="e.g. Amber & Oud"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
              hasError={!!errors.name}
            />
          </Field>
          <Field label="Subtitle">
            <Input
              placeholder="e.g. Luxury Scented Candle"
              value={form.subtitle}
              onChange={(v) => handleChange("subtitle", v)}
            />
          </Field>
        </div>

        {/* ── Price + Category ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Price (EGP)" error={errors.price} required>
            <Input
              type="number"
              placeholder="e.g. 349"
              value={form.price}
              onChange={(v) => handleChange("price", v)}
              hasError={!!errors.price}
            />
          </Field>
          <Field label="Category" error={errors.category} required>
            <div className="relative">
              <Input
                placeholder="e.g. Floral, Woody, Oriental…"
                value={form.category}
                onChange={(v) => handleChange("category", v)}
                hasError={!!errors.category}
              />
              {form.category.trim() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-primary/50 font-medium pointer-events-none">
                  → {normalizeCategory(form.category)}
                </span>
              )}
            </div>
          </Field>
        </div>

        {/* ── Scents ── */}
        <Field label="Scents" error={errors.scents} required>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={scentInput}
                onChange={(e) => setScentInput(e.target.value)}
                onKeyDown={handleScentKey}
                placeholder="e.g. Oud, Amber, Musk…"
                className="w-full sm:flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={addScent}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary text-accent text-sm font-semibold hover:bg-dark transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {scents.length > 0 ? (
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
                      className="text-primary/60 hover:text-primary ml-0.5 leading-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-primary/40 italic">
                No scents added yet — type a scent and press Enter or click Add.
              </p>
            )}
          </div>
        </Field>

        {/* ── Description ── */}
        <Field label="Description" error={errors.description} required>
          <textarea
            rows={3}
            placeholder="Describe the candle's mood and character…"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors resize-none ${
              errors.description ? "border-red-400" : "border-border"
            }`}
          />
        </Field>

        {/* ── Image URL ── */}
        <Field label="Image URL" error={errors.image} required>
          <Input
            placeholder="https://…"
            value={form.image}
            onChange={(v) => handleChange("image", v)}
            hasError={!!errors.image}
          />
          {form.image && (
            <div className="mt-2 rounded-xl overflow-hidden h-32 border border-border">
              <img
                src={form.image}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </Field>

        {/* ── Size + In Stock ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
          <Field label="Size in grams (optional)">
            <Input
              type="number"
              placeholder="e.g. 150"
              value={form.size}
              onChange={(v) => handleChange("size", v)}
            />
          </Field>

          <div className="flex items-center gap-3 pb-1">
            <button
              type="button"
              onClick={() => handleChange("inStock", !form.inStock)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                form.inStock ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-[4px] left-[4px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  form.inStock ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-dark">
              {form.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-border" />

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM);
              setScents([]);
              setErrors({});
            }}
            className="px-5 py-2.5 rounded-xl border border-border text-dark text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-2.5 rounded-xl bg-primary text-accent text-sm font-semibold hover:bg-dark transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <span className="text-base">🕯️</span>
                Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Field({ label, children, error, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
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
      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-dark placeholder:text-primary/40 focus:outline-none focus:border-primary transition-colors ${
        hasError ? "border-red-400" : "border-border"
      }`}
    />
  );
}
