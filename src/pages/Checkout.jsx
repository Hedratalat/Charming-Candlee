import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useCart } from "../context/CartContext";

/* ─── Guest ID ───────────────────────────────────────────── */
const getGuestId = () => {
  const existing = localStorage.getItem("guestId");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("guestId", id);
  return id;
};

/* ─── Zod Schema ─────────────────────────────────────────── */
const checkoutSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Please enter a valid name")
      .max(40, "Please enter a valid name")
      .regex(/^[A-Za-z\u0600-\u06FF\s]+$/, "Letters only please"),
    phone: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian number"),
    whatsapp: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "Enter a valid WhatsApp number"),
    city: z.string().min(1, "Please select a city"),
    area: z
      .string()
      .min(2, "Area is required")
      .max(50, "Area is too long")
      .regex(/^[A-Za-z\u0600-\u06FF0-9\s]+$/, "Invalid area format"),
    address: z
      .string()
      .min(10, "Address must be at least 10 characters")
      .max(200, "Address is too long")
      .regex(/^[A-Za-z0-9\u0600-\u06FF\s,.-]+$/, "Invalid address format"),
    floor: z.string().regex(/^\d*$/, "Numbers only").optional(),
    paymentMethod: z.enum(["cash", "instapay", "orange"]),
    referenceNumber: z.string().optional(),
    orangeReferenceNumber: z.string().optional(),
    orangeSenderPhone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod !== "instapay") return true;
      const ref = data.referenceNumber?.trim() || "";
      return (
        ref !== "" && /^\d+$/.test(ref) && ref.length >= 8 && ref.length <= 20
      );
    },
    {
      message: "Reference number is required (8–20 digits)",
      path: ["referenceNumber"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod !== "orange") return true;
      const ref = data.orangeReferenceNumber?.trim() || "";
      return (
        ref !== "" && /^\d+$/.test(ref) && ref.length >= 8 && ref.length <= 20
      );
    },
    {
      message: "Reference number is required (8–20 digits)",
      path: ["orangeReferenceNumber"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod !== "orange") return true;
      const phone = data.orangeSenderPhone?.trim() || "";
      return /^01[0125][0-9]{8}$/.test(phone);
    },
    {
      message: "Enter a valid Egyptian number",
      path: ["orangeSenderPhone"],
    },
  );

/* ─── Cities & Fees ──────────────────────────────────────── */
const egyptCities = [
  { id: "cairo", label: "Cairo" },
  { id: "giza", label: "Giza" },
  { id: "fayoum", label: "Fayoum" },
  { id: "beni-suef", label: "Beni Suef" },
  { id: "minya", label: "Minya" },
  { id: "assiut", label: "Assiut" },
  { id: "sohag", label: "Sohag" },
  { id: "qena", label: "Qena" },
  { id: "nag-hammadi", label: "Nag Hammadi" },
  { id: "luxor", label: "Luxor" },
  { id: "aswan", label: "Aswan" },
  { id: "alexandria", label: "Alexandria" },
  { id: "tanta", label: "Tanta" },
  { id: "mahalla", label: "Mahalla" },
  { id: "mansoura", label: "Mansoura" },
  { id: "suez", label: "Suez" },
  { id: "beheira", label: "Beheira" },
  { id: "sharqia", label: "Sharqia" },
  { id: "10th-of-ramadan", label: "10th of Ramadan" },
  { id: "port-said", label: "Port Said" },
  { id: "ismailia", label: "Ismailia" },
  { id: "damietta", label: "Damietta" },
  { id: "kafr-elsheikh", label: "Kafr El Sheikh" },
  { id: "qalyubia", label: "Qalyubia" },
  { id: "al-gharbia", label: "Al Gharbia" },
  { id: "monufia", label: "Monufia" },
  { id: "dakahlia", label: "Dakahlia" },
  { id: "north-coast", label: "North Coast" },
  { id: "marsa-matrouh", label: "Marsa Matrouh" },
  { id: "hurghada", label: "Hurghada" },
  { id: "sharm-el-sheikh", label: "Sharm El Sheikh" },
  { id: "marsa-alam", label: "Marsa Alam" },
  { id: "banha", label: "Banha" },
  { id: "badrashin", label: "Badrashin" },
  { id: "hawamdeya", label: "Hawamdeya" },
  { id: "saqqara", label: "Saqqara" },
  { id: "badr-city", label: "Badr City" },
];

const shippingFees = {
  cairo: 70,
  giza: 70,
  fayoum: 110,
  "beni-suef": 110,
  minya: 110,
  assiut: 110,
  sohag: 110,
  qena: 110,
  "nag-hammadi": 110,
  luxor: 110,
  aswan: 120,
  alexandria: 90,
  tanta: 100,
  mahalla: 100,
  mansoura: 100,
  suez: 100,
  beheira: 100,
  sharqia: 100,
  "10th-of-ramadan": 100,
  "port-said": 100,
  ismailia: 100,
  damietta: 100,
  "kafr-elsheikh": 100,
  qalyubia: 100,
  "al-gharbia": 100,
  monufia: 100,
  dakahlia: 100,
  "north-coast": 130,
  "marsa-matrouh": 130,
  hurghada: 140,
  "sharm-el-sheikh": 140,
  "marsa-alam": 140,
  banha: 85,
  badrashin: 85,
  hawamdeya: 85,
  saqqara: 90,
  "badr-city": 85,
};

/* ─── Sub-components ─────────────────────────────────────── */

function Field({ label, error, children, optional = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary/50">
        {label}
        {optional && (
          <span className="normal-case ml-1 opacity-60">(optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[11.5px] text-red-500 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}

const inputCls = (hasError) =>
  `w-full bg-accent border rounded-xl px-4 py-2.5 text-[14px] text-dark outline-none
   transition-colors duration-200 font-body
   ${
     hasError
       ? "border-red-400 focus:border-red-400"
       : "border-border focus:border-primary/60"
   }`;

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-secondary border border-border rounded-[20px] p-5 sm:p-6
        shadow-[0_2px_12px_rgba(61,31,10,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-[3px] h-[18px] bg-primary rounded-full shrink-0" />
      <h3 className="font-heading text-[17px] font-semibold text-dark">
        {children}
      </h3>
    </div>
  );
}

function PayOption({ id, icon, label, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200
        ${
          selected
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border bg-accent hover:border-primary/40 hover:bg-white"
        }`}
    >
      {selected && (
        <span
          className="absolute top-2 right-2 w-[18px] h-[18px] bg-primary rounded-full
          flex items-center justify-center"
        >
          <svg
            viewBox="0 0 12 10"
            className="w-2.5 h-2.5"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <polyline points="1.5,5 4.5,8 10.5,2" />
          </svg>
        </span>
      )}
      <span className="text-3xl">{icon}</span>
      <span className="text-[12px] font-semibold text-dark text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

function NumberBox({ number, sublabel }) {
  return (
    <div className="bg-accent border border-dashed border-primary/40 rounded-xl py-3 px-4 text-center my-3">
      <p className="font-heading text-[22px] font-bold text-primary tracking-wide">
        {number}
      </p>
      <p className="text-[11px] text-primary/50 mt-0.5">{sublabel}</p>
    </div>
  );
}

function Steps({ steps }) {
  return (
    <ul className="space-y-2 my-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] text-dark">
          <span
            className="w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold
            rounded-full flex items-center justify-center shrink-0 mt-0.5"
          >
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ul>
  );
}

/* ─── Reference Modal ────────────────────────────────────── */
function RefModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-secondary border border-border rounded-[20px] max-w-sm w-full p-5
          shadow-2xl animate-[toast-in_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-heading text-[17px] font-bold text-dark">
            Where's the Reference?
          </h4>
          <button
            onClick={onClose}
            className="text-primary/50 hover:text-primary text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="bg-accent rounded-2xl overflow-hidden border border-border mb-4">
          <div className="bg-dark text-white text-center py-3 px-4">
            <p className="text-[13px] font-semibold">✓ Transfer Successful</p>
            <p className="text-[11px] opacity-60 mt-0.5">
              Transaction Completed
            </p>
          </div>
          <div className="p-4 space-y-1 text-[13px]">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-primary/60">Amount</span>
              <span className="font-semibold text-dark">850.00 EGP</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-primary/60">Recipient</span>
              <span className="font-semibold text-dark">Store Name</span>
            </div>
            <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-xl p-3 my-2 text-center">
              <p className="text-[10px] font-bold text-yellow-800 mb-1">
                🎯 Reference Number — copy this!
              </p>
              <p className="font-mono font-black text-yellow-900 text-[16px]">
                TRX2025123456
              </p>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-primary/60">Date</span>
              <span className="font-semibold text-dark">22 Dec 2025</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-primary/60">Status</span>
              <span className="font-semibold text-green-700">✓ Completed</span>
            </div>
          </div>
        </div>

        <div className="bg-primary/8 border-l-[3px] border-primary rounded-r-xl p-3 text-[12px] text-dark mb-4">
          ⚠️ Copy the reference number immediately after the transfer completes.
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary text-accent font-semibold text-[14px] py-3 rounded-xl
            cursor-pointer hover:bg-[#7a5030] transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

/* ─── Cart Summary ───────────────────────────────────────── */
function CartSummary({
  cart,
  subtotal,
  shippingCost,
  grandTotal,
  selectedCity,
}) {
  return (
    <Card>
      <SectionTitle>Order Summary</SectionTitle>

      {cart.length === 0 ? (
        <p className="text-[13px] text-primary/50 text-center py-6">
          🕯️ Your cart is empty
        </p>
      ) : (
        <div className="divide-y divide-border">
          {cart.map((item) => (
            <div
              key={item.cartKey || item.id}
              className="flex items-center gap-3 py-3"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-accent border border-border">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-xl">
                    🕯️
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-dark truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-primary/50 truncate mt-0.5">
                  {item.selectedScents?.length > 0
                    ? `🌿 ${item.selectedScents.join(" · ")}`
                    : item.scent}
                </p>
              </div>
              <span
                className="text-[11px] text-primary font-semibold bg-primary/10
                px-2 py-0.5 rounded-full shrink-0"
              >
                ×{item.quantity}
              </span>
              <span className="font-heading text-[14px] font-bold text-primary shrink-0">
                {item.price * item.quantity} EGP
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-[13px] text-primary/60">
          <span>Subtotal</span>
          <span className="tabular-nums">{subtotal} EGP</span>
        </div>
        <div className="flex justify-between text-[13px] text-primary/60">
          <span>Shipping</span>
          <span>
            {selectedCity ? `${shippingCost} EGP` : "Select city first"}
          </span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between items-baseline">
          <span className="text-[16px] text-dark font-semibold">Total</span>
          <span className="font-heading text-[22px] font-bold text-primary tabular-nums">
            {grandTotal} EGP
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  const [showRefModal, setShowRefModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
  });

  const paymentMethod = watch("paymentMethod");
  const selectedCity = watch("city");
  const shippingCost = selectedCity ? shippingFees[selectedCity] || 0 : 0;
  const grandTotal = cartTotal + shippingCost;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onSubmit = async (data) => {
    try {
      const guestId = getGuestId();

      let paymentMethodForDB = data.paymentMethod;
      if (data.paymentMethod === "orange") paymentMethodForDB = "orange cash";

      const orderData = {
        ...data,
        paymentMethod: paymentMethodForDB,
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.name || "Unknown Product",
          price: Number(item.price || 0),
          quantity: item.quantity,
          total: Number(item.price || 0) * item.quantity,
          image: item.image || "",
          category: item.category || "",
        })),
        subtotal: cartTotal,
        shippingFee: shippingCost,
        grandTotal,
        status: "pending",
        createdAt: serverTimestamp(),
        orderNumber: `ORD-${Date.now()}`,
        guestId,
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      toast.success(
        "Order placed successfully! Thank you for shopping with us.",
      );

      setTimeout(() => {
        navigate("/order-success", {
          state: {
            whatsapp: orderData.whatsapp,
            paymentMethod: orderData.paymentMethod,
          },
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1500);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  /* ─── Render ─── */
  return (
    <>
      <Navbar />

      <div className="font-body bg-accent min-h-screen py-12 px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-10">
          <p className="text-[11px] text-primary font-medium tracking-[0.14em] uppercase mb-2">
            Almost there
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
            Complete Your <span className="text-primary">Order</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
          {/* ── LEFT: Form ── */}
          <div className="flex flex-col gap-5">
            {/* Delivery Details */}
            <Card>
              <SectionTitle>Delivery Details</SectionTitle>
              <div className="space-y-4">
                <Field label="Full Name *" error={errors.fullName}>
                  <input
                    {...register("fullName")}
                    placeholder="Ahmed Mohamed"
                    className={inputCls(!!errors.fullName)}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Phone *" error={errors.phone}>
                    <input
                      {...register("phone")}
                      placeholder="01XXXXXXXXX"
                      className={inputCls(!!errors.phone)}
                    />
                  </Field>
                  <Field label="WhatsApp *" error={errors.whatsapp}>
                    <input
                      {...register("whatsapp")}
                      placeholder="01XXXXXXXXX"
                      className={inputCls(!!errors.whatsapp)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City *" error={errors.city}>
                    <select
                      {...register("city")}
                      className={inputCls(!!errors.city)}
                    >
                      <option value="">Select city</option>
                      {egyptCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Area *" error={errors.area}>
                    <input
                      {...register("area")}
                      placeholder="Nasr City, Maadi..."
                      className={inputCls(!!errors.area)}
                    />
                  </Field>
                </div>

                <Field label="Full Address *" error={errors.address}>
                  <textarea
                    {...register("address")}
                    rows={2}
                    placeholder="Street name, building number..."
                    className={inputCls(!!errors.address)}
                  />
                </Field>

                <Field label="Floor" error={errors.floor} optional>
                  <input
                    {...register("floor")}
                    placeholder="e.g. 3 "
                    className={`${inputCls(!!errors.floor)} max-w-[120px]`}
                  />
                </Field>
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <SectionTitle>Payment Method</SectionTitle>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "cash", icon: "💵", label: "Cash on Delivery" },
                  { id: "instapay", icon: "⚡", label: "Instapay" },
                  { id: "orange", icon: "📱", label: "Orange Cash" },
                ].map((m) => (
                  <PayOption
                    key={m.id}
                    {...m}
                    selected={paymentMethod === m.id}
                    onSelect={(id) =>
                      setValue("paymentMethod", id, { shouldValidate: true })
                    }
                  />
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-[11.5px] text-red-500 mt-2">
                  Please select a payment method
                </p>
              )}

              {/* ── Instapay section ── */}
              {paymentMethod === "instapay" && (
                <div className="mt-4 bg-primary/5 border border-border rounded-2xl p-5">
                  <p className="text-[13px] font-semibold text-dark mb-1">
                    Transfer to this Instapay account:
                  </p>
                  <NumberBox
                    number="01200291296"
                    sublabel="Store Instapay Account"
                  />
                  <Steps
                    steps={[
                      "Transfer the total amount shown on the right",
                      "You'll receive a reference number after the transfer",
                      "Enter that reference number below",
                    ]}
                  />

                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary/50">
                      Reference Number *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRefModal(true)}
                      className="text-[12px] text-primary underline cursor-pointer hover:text-dark transition-colors"
                    >
                      Where to find it?
                    </button>
                  </div>
                  <input
                    {...register("referenceNumber")}
                    placeholder="Enter Instapay reference number"
                    className={inputCls(!!errors.referenceNumber)}
                  />
                  {errors.referenceNumber && (
                    <p className="text-[11.5px] text-red-500 mt-1">
                      {errors.referenceNumber.message}
                    </p>
                  )}
                </div>
              )}

              {/* ── Orange Cash section ── */}
              {paymentMethod === "orange" && (
                <div className="mt-4 bg-primary/5 border border-border rounded-2xl p-5">
                  <p className="text-[13px] font-semibold text-dark mb-1">
                    Send payment to this number:
                  </p>
                  <NumberBox
                    number="01213328280"
                    sublabel="Store Orange Cash Number"
                  />
                  <Steps
                    steps={[
                      "Send the total amount via Orange Cash",
                      "You'll receive a reference number after the transfer",
                      "Enter the reference number and your phone number below",
                    ]}
                  />

                  <div className="space-y-4 mt-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary/50 block mb-1">
                        Reference Number *
                      </label>
                      <input
                        {...register("orangeReferenceNumber")}
                        placeholder="Enter Orange Cash reference number"
                        className={inputCls(!!errors.orangeReferenceNumber)}
                      />
                      {errors.orangeReferenceNumber && (
                        <p className="text-[11.5px] text-red-500 mt-1">
                          {errors.orangeReferenceNumber.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary/50 block mb-1">
                        Sender Phone Number *
                      </label>
                      <input
                        {...register("orangeSenderPhone")}
                        placeholder="01XXXXXXXXX"
                        className={inputCls(!!errors.orangeSenderPhone)}
                      />
                      {errors.orangeSenderPhone && (
                        <p className="text-[11.5px] text-red-500 mt-1">
                          {errors.orangeSenderPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT: Summary + Submit ── */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-4">
            <CartSummary
              cart={cart}
              subtotal={cartTotal}
              shippingCost={shippingCost}
              grandTotal={grandTotal}
              selectedCity={selectedCity}
            />

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-primary text-accent font-semibold text-[15px]
                py-4 rounded-2xl cursor-pointer hover:bg-[#7a5030] transition-colors
                tracking-[0.02em] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                shadow-[0_4px_16px_rgba(147,97,55,0.3)]"
            >
              {isSubmitting ? "Processing..." : "Confirm Order ✦"}
            </button>
          </div>
        </div>
      </div>

      <RefModal open={showRefModal} onClose={() => setShowRefModal(false)} />

      <Footer />
    </>
  );
}
