import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Sparks — CSS only, super lightweight ───────────────── */
const SPARKS = [
  { emoji: "🕯️", left: "5%", delay: "0s", dur: "2.6s" },
  { emoji: "✨", left: "12%", delay: "0.4s", dur: "2.3s" },
  { emoji: "🌿", left: "19%", delay: "0.8s", dur: "2.8s" },
  { emoji: "💛", left: "26%", delay: "0.2s", dur: "2.5s" },
  { emoji: "✨", left: "33%", delay: "0.6s", dur: "3.0s" },
  { emoji: "🌸", left: "40%", delay: "1.0s", dur: "2.4s" },
  { emoji: "🕯️", left: "47%", delay: "0.1s", dur: "2.7s" },
  { emoji: "🌟", left: "54%", delay: "0.5s", dur: "2.9s" },
  { emoji: "🌿", left: "61%", delay: "0.9s", dur: "2.3s" },
  { emoji: "💫", left: "68%", delay: "0.3s", dur: "2.6s" },
  { emoji: "✨", left: "75%", delay: "0.7s", dur: "2.8s" },
  { emoji: "🌸", left: "82%", delay: "0.15s", dur: "2.5s" },
  { emoji: "🕯️", left: "89%", delay: "0.55s", dur: "2.7s" },
  { emoji: "💛", left: "95%", delay: "1.1s", dur: "3.1s" },
];
function Sparks() {
  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)    scale(0.7); opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(-220px) scale(1); opacity: 0; }
        }
        .spark {
          position: absolute;
          bottom: 38%;
          font-size: 20px;
          pointer-events: none;
animation: floatUp var(--dur) var(--delay) ease-out infinite;        }
      `}</style>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="spark"
          style={{ left: s.left, "--delay": s.delay, "--dur": s.dur }}
        >
          {s.emoji}
        </span>
      ))}
    </>
  );
}

/* ─── Candle (CSS flicker, no Framer) ────────────────────── */
function CandleFlame() {
  return (
    <>
      <style>{`
        @keyframes flicker {
          0%,100% { transform: scaleX(1)   scaleY(1);   }
          25%      { transform: scaleX(1.1) scaleY(0.95);}
          50%      { transform: scaleX(0.9) scaleY(1.08);}
          75%      { transform: scaleX(1.05) scaleY(0.97);}
        }
        .flame { animation: flicker 1.6s ease-in-out infinite; transform-origin: center bottom; }
      `}</style>
      <svg
        width="44"
        height="76"
        viewBox="0 0 44 76"
        fill="none"
        className="mx-auto mb-1"
      >
        <g className="flame">
          <ellipse cx="22" cy="20" rx="9" ry="14" fill="#F59E0B" />
          <ellipse cx="22" cy="24" rx="5" ry="9" fill="#FDE68A" />
        </g>
        <rect x="20.5" y="32" width="3" height="7" rx="1.5" fill="#3D1F0A" />
        <rect x="12" y="38" width="20" height="30" rx="4" fill="#936137" />
        <rect
          x="15"
          y="38"
          width="4"
          height="30"
          rx="2"
          fill="#A97040"
          opacity="0.4"
        />
      </svg>
    </>
  );
}

/* ─── Check ring ─────────────────────────────────────────── */
function CheckRing() {
  return (
    <motion.div
      className="relative w-20 h-20 mx-auto mb-5"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.15 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-[3px] border-primary"
        initial={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-9 h-9"
          fill="none"
          stroke="#FFF8F0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4,12 9,17 20,7" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─── Payment badge ──────────────────────────────────────── */
function PaymentBadge({ method }) {
  const map = {
    cash: {
      icon: "💵",
      label: "You'll pay on delivery",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    instapay: {
      icon: "⚡",
      label: "Payment received via Instapay",
      color: "bg-amber-50 border-amber-200 text-amber-800",
    },
    "orange cash": {
      icon: "📱",
      label: "Payment received via Orange Cash",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    orange: {
      icon: "📱",
      label: "Payment received via Orange Cash",
      color: "bg-red-50 border-red-200 text-red-800",
    },
  };
  const { icon, label, color } = map[method] || map.cash;
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-[14px] font-semibold ${color}`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ─── Info row ───────────────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <span className="text-lg opacity-70">{icon}</span>
      <span className="text-[13px] text-primary/50 flex-1">{label}</span>
      <span className="text-[13px] font-semibold text-dark">{value}</span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSparks, setShowSparks] = useState(true);

  const paymentMethod = location.state?.paymentMethod || "cash";
  const whatsapp = location.state?.whatsapp || "—";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const t = setTimeout(() => setShowSparks(false), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Navbar />

      <div className="font-body bg-accent min-h-screen py-16 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Sparks — يختفوا بعد 3.5 ثانية */}
        {showSparks && <Sparks />}

        {/* Card */}
        <motion.div
          className="relative z-10 bg-secondary border border-border rounded-[28px] shadow-[0_8px_40px_rgba(61,31,10,0.10)] max-w-md w-full px-6 py-10"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="text-center mb-2">
            <CandleFlame />
          </div>
          <CheckRing />

          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
          >
            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-primary mb-1.5">
              Thank you
            </p>
            <h2 className="font-heading text-3xl font-bold text-dark mb-2">
              Order <span className="text-primary">Confirmed!</span>
            </h2>
            <p className="text-[14px] text-primary/60">
              Your order has been placed successfully.
            </p>
          </motion.div>

          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            <PaymentBadge method={paymentMethod} />
          </motion.div>

          <motion.div
            className="bg-accent border border-border rounded-2xl px-4 mb-6"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
          >
            <InfoRow
              icon="📱"
              label="WhatsApp confirmation to"
              value={whatsapp}
            />
            <InfoRow
              icon="🚚"
              label="Estimated delivery"
              value="2–5 business days"
            />
          </motion.div>

          <motion.p
            className="text-[12.5px] text-primary/50 text-center mb-6 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            We'll send you a WhatsApp message to confirm your order details and
            delivery time.
          </motion.p>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-primary/30 font-medium">
              what's next?
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <button
              onClick={() => navigate("/myorders")}
              className="w-full bg-primary text-accent font-semibold text-[15px]
                py-3.5 rounded-2xl cursor-pointer hover:bg-[#7a5030] transition-colors
                tracking-[0.02em] active:scale-[0.99]
                shadow-[0_4px_16px_rgba(147,97,55,0.28)]"
            >
              View My Orders ✦
            </button>
            <button
              onClick={() => {
                navigate("/products");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full bg-transparent border border-border text-primary font-semibold text-[14px]
                py-3 rounded-2xl cursor-pointer hover:bg-primary/5 transition-colors"
            >
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>

        <motion.p
          className="mt-8 text-[12px] text-primary text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          🕯️ Crafted with love · Charming Candlee
        </motion.p>
      </div>

      <Footer />
    </>
  );
}
