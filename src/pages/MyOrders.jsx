import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useNavigate } from "react-router-dom";

const getGuestId = () => {
  const existing = localStorage.getItem("guestId");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("guestId", id);
  return id;
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-300",
    desc: "Your order has been received and is awaiting confirmation.",
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    border: "border-blue-300",
    desc: "Your order is being prepared and will ship soon.",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-300",
    desc: "Your order has been delivered. Enjoy 🕯️",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const PAY_ICONS = { cash: "💵", instapay: "⚡", "orange cash": "📱" };
function PayPill({ method }) {
  const icon = PAY_ICONS[method?.toLowerCase()] || "💳";
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-[13px] font-semibold px-3 py-1 rounded-full">
      {icon} {method}
    </span>
  );
}

const STEPS = ["pending", "processing", "completed"];
function ProgressBar({ status }) {
  const current = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 my-4">
      {STEPS.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const done = i <= current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all
                  ${done ? `${cfg.dot} border-transparent text-white` : "bg-accent border-border text-primary/30"}`}
              >
                {done && i < current ? "✓" : i + 1}
              </div>
              <span
                className={`text-[11px] uppercase tracking-widest font-bold ${done ? cfg.text : "text-primary/30"}`}
              >
                {cfg.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-1 mb-5 rounded-full transition-all ${i < current ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ onShop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="text-6xl mb-4 animate-float inline-block">🕯️</div>
      <h3 className="font-heading text-2xl font-bold text-dark mb-2">
        No Orders Yet
      </h3>
      <p className="text-primary/50 text-[16px] mb-8">
        Looks like you haven't placed any orders yet.
      </p>
      <button
        onClick={onShop}
        className="bg-primary text-accent font-semibold text-[16px] px-6 py-3 rounded-2xl
          hover:bg-[#7a5030] transition-colors shadow-[0_4px_16px_rgba(147,97,55,0.25)]"
      >
        Start Shopping ✦
      </button>
    </motion.div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const guestId = getGuestId();
    const q = query(collection(db, "orders"), where("guestId", "==", guestId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar />

      <div className="font-body bg-accent min-h-screen py-12 px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-[13px] text-primary font-medium tracking-[0.14em] uppercase mb-2">
            Your account
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
            My <span className="text-primary">Orders</span>
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-primary/40 text-[15px]">
                Loading your orders...
              </p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <EmptyState
              onShop={() => {
                navigate("/products");
                window.scrollTo({ top: 0 });
              }}
            />
          )}

          {!loading && orders.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-[14px] text-primary/40 text-right">
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </p>

              <AnimatePresence>
                {orders.map((order, idx) => {
                  const isExpanded = expandedOrder === order.id;
                  const cfg =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white border border-border rounded-2xl shadow-[0_2px_16px_rgba(61,31,10,0.06)] overflow-hidden"
                    >
                      {/* Card header */}
                      <div
                        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                      >
                        <div
                          className={`w-1 h-10 rounded-full shrink-0 ${cfg.dot}`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <StatusBadge status={order.status} />
                            <PayPill method={order.paymentMethod} />
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-heading font-bold text-primary text-[20px]">
                            {order.grandTotal} EGP
                          </p>
                          {order.createdAt && (
                            <p className="text-[12px] text-primary/40 mt-0.5">
                              {order.createdAt
                                .toDate()
                                .toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </div>

                        <span
                          className={`text-primary/50 text-[28px] leading-none transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          ▾
                        </span>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-border pt-4">
                              {/* Status description */}
                              <div
                                className={`${cfg.bg} ${cfg.border} border rounded-xl px-4 py-3 mb-4`}
                              >
                                <p
                                  className={`text-[15px] font-semibold ${cfg.text}`}
                                >
                                  {cfg.desc}
                                </p>
                              </div>

                              <ProgressBar status={order.status} />

                              {/* Delivery info */}
                              <div className="bg-accent border border-border rounded-xl p-4 mb-4">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-primary/40 mb-3">
                                  Delivery Info
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-[15px]">
                                  <div>
                                    <span className="text-primary/50 block text-[12px] mb-0.5">
                                      City
                                    </span>
                                    <span className="text-dark font-medium capitalize">
                                      {order.city}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-primary/50 block text-[12px] mb-0.5">
                                      Area
                                    </span>
                                    <span className="text-dark font-medium">
                                      {order.area}
                                    </span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-primary/50 block text-[12px] mb-0.5">
                                      Address
                                    </span>
                                    <span className="text-dark font-medium">
                                      {order.address}
                                    </span>
                                  </div>
                                  {order.floor && (
                                    <div>
                                      <span className="text-primary/50 block text-[12px] mb-0.5">
                                        Floor
                                      </span>
                                      <span className="text-dark font-medium">
                                        {order.floor}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-primary/50 block text-[12px] mb-0.5">
                                      Est. Delivery
                                    </span>
                                    <span className="text-dark font-medium">
                                      2–5 business days
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Items */}
                              <p className="text-[11px] font-bold uppercase tracking-widest text-primary/40 mb-3">
                                Items
                              </p>
                              <div className="flex flex-col gap-2 mb-4">
                                {order.items?.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-3 bg-accent rounded-xl p-3 border border-border"
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.productName}
                                      className="w-14 h-14 object-cover rounded-lg shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-dark text-[15px] truncate">
                                        {item.productName}
                                      </p>
                                      <p className="text-[13px] text-primary/50 mt-0.5">
                                        {item.quantity} × {item.price} EGP
                                      </p>
                                    </div>
                                    <span className="font-heading font-bold text-primary text-[16px] shrink-0">
                                      {item.total} EGP
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Totals */}
                              <div className="bg-accent border border-border rounded-xl p-4 text-[15px]">
                                <div className="flex justify-between text-primary/60 mb-1">
                                  <span>Subtotal</span>
                                  <span>{order.subtotal} EGP</span>
                                </div>
                                <div className="flex justify-between text-primary/60 mb-2">
                                  <span>Shipping</span>
                                  <span>{order.shippingFee} EGP</span>
                                </div>
                                <div className="flex justify-between font-bold text-dark border-t border-border pt-2">
                                  <span>Grand Total</span>
                                  <span className="text-primary font-heading text-[18px]">
                                    {order.grandTotal} EGP
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <button
                onClick={() => {
                  navigate("/products");
                  window.scrollTo({ top: 0 });
                }}
                className="w-full mt-2 bg-transparent border border-border text-primary font-semibold text-[16px]
                  py-3 rounded-2xl hover:bg-primary/5 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
