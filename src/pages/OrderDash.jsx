import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-300",
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    border: "border-blue-300",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-300",
  },
};

/* ─── Tiny badge ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Payment method pill ────────────────────────────────── */
const PAY_ICONS = {
  cash: "💵",
  instapay: "⚡",
  "orange cash": "📱",
};
function PayPill({ method }) {
  const icon = PAY_ICONS[method?.toLowerCase()] || "💳";
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">
      {icon} {method}
    </span>
  );
}

/* ─── Info cell ──────────────────────────────────────────── */
function Cell({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40">
        {label}
      </span>
      <span className="text-[13px] text-dark font-medium">{value}</span>
    </div>
  );
}

/* ─── Divider ────────────────────────────────────────────── */
function Divider() {
  return <div className="h-px bg-border my-4" />;
}

/* ─── Select ─────────────────────────────────────────────── */
function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-accent border border-border text-dark text-[13px] font-medium px-3 py-2 rounded-xl outline-none focus:border-primary/60 transition-colors cursor-pointer"
    >
      {children}
    </select>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function OrderDash() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const [filter, setFilter] = useState({
    status: "all",
    paymentMethod: "all",
    city: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      setOrders(data);
    });
    return () => unsubscribe();
  }, []);

  const displayPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  /* ─── WhatsApp confirm ─── */
  const handleConfirmOrder = (order) => {
    const phone = order.whatsapp || order.phone;
    const clean = phone?.replace(/\D/g, "");
    const waPhone = clean?.startsWith("20")
      ? clean
      : "2" + (clean?.startsWith("0") ? clean : "0" + clean);

    const itemsList = order.items
      ?.map(
        (i) =>
          `  - ${i.productName} (${i.quantity} × ${i.price} = ${i.total} EGP)`,
      )
      .join("\n");

    const msg = `تم تأكيد طلبك 

مرحباً ${order.fullName}

 المنتجات:
${itemsList}

 تفاصيل الدفع:
المجموع: ${order.subtotal} EGP
رسوم الشحن: ${order.shippingFee} EGP
الإجمالي: ${order.grandTotal} EGP
طريقة الدفع: ${order.paymentMethod}${order.referenceNumber ? `\nرقم المرجع: ${order.referenceNumber}` : ""}

 عنوان التوصيل:
${order.address}
المنطقة: ${order.area}
المدينة: ${order.city}${order.floor ? `\nالدور: ${order.floor}` : ""}

 رقم التليفون: ${order.phone}
 رقم الواتساب: ${order.whatsapp}

`;

    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      displayPopup("Status updated!", "success");
    } catch {
      displayPopup("Failed to update status", "error");
    }
  };

  const confirmDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteDoc(doc(db, "orders", orderToDelete));
      displayPopup("Order deleted!", "success");
    } catch {
      displayPopup("Failed to delete order", "error");
    } finally {
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter((f) => ({ ...f, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      (filter.status === "all" ||
        order.status?.toLowerCase() === filter.status) &&
      (filter.paymentMethod === "all" ||
        order.paymentMethod?.toLowerCase() === filter.paymentMethod) &&
      (filter.city === "all" || order.city === filter.city);

    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      order.fullName?.toLowerCase().includes(q) ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.phone?.includes(searchTerm) ||
      order.whatsapp?.includes(searchTerm) ||
      order.address?.toLowerCase().includes(q) ||
      order.city?.toLowerCase().includes(q) ||
      order.area?.toLowerCase().includes(q) ||
      order.referenceNumber?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  /* ─── Stats ─── */
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-accent font-body">
      {/* ── Top bar ── */}
      <div className="max-w-6xl mx-auto mb-0 sm:mb-4 mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] text-primary font-semibold tracking-[0.16em] uppercase mb-1">
            Dashboard
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
            Orders
          </h2>
          <p className="text-sm text-primary/60 mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <span className="text-white/30 text-[12px] tabular-nums">
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 ">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              color: "text-dark",
              bg: "bg-white border-border",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "text-amber-700",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Processing",
              value: stats.processing,
              color: "text-blue-700",
              bg: "bg-blue-50 border-blue-200",
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "text-emerald-700",
              bg: "bg-emerald-50 border-emerald-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} border rounded-2xl p-4 text-center`}
            >
              <p className={`font-heading text-3xl font-bold ${s.color}`}>
                {s.value}
              </p>
              <p className="text-[11px] text-primary/50 uppercase tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + Filters ── */}
        <div className="bg-white border border-border rounded-2xl p-4 mb-6 shadow-[0_2px_12px_rgba(61,31,10,0.05)]">
          <input
            type="text"
            placeholder="🔍  Search by name, order #, phone, address, city, area, reference..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-[13px] text-dark outline-none focus:border-primary/60 transition-colors mb-3 placeholder:text-primary/30"
          />
          <div className="flex gap-3 flex-wrap">
            <FilterSelect
              value={filter.status}
              onChange={(v) => handleFilterChange("status", v)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </FilterSelect>

            <FilterSelect
              value={filter.paymentMethod}
              onChange={(v) => handleFilterChange("paymentMethod", v)}
            >
              <option value="all">All Payment</option>
              <option value="cash">Cash</option>
              <option value="orange cash">Orange Cash</option>
              <option value="instapay">Instapay</option>
            </FilterSelect>

            <FilterSelect
              value={filter.city}
              onChange={(v) => handleFilterChange("city", v)}
            >
              <option value="all">All Cities</option>
              {Array.from(
                new Set(orders.map((o) => o.city).filter(Boolean)),
              ).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </FilterSelect>

            <span className="ml-auto self-center text-[12px] text-primary/50">
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Orders ── */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {currentOrders.map((order, idx) => {
              const isExpanded = expandedOrder === order.id;
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white border border-border rounded-2xl shadow-[0_2px_16px_rgba(61,31,10,0.06)] overflow-hidden"
                >
                  {/* ── Card header ── */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                  >
                    {/* Status stripe */}
                    <div
                      className={`w-1 h-10 rounded-full shrink-0 ${cfg.dot}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-dark text-[15px]">
                          {order.fullName}
                        </span>
                        <span className="text-[11px] text-primary/40 font-mono">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <StatusBadge status={order.status} />
                        <PayPill method={order.paymentMethod} />
                        <span className="text-[12px] text-primary/50">
                          {order.city}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-heading font-bold text-primary text-[18px]">
                        {order.grandTotal} EGP
                      </p>
                      {order.createdAt && (
                        <p className="text-[10px] text-primary/40 mt-0.5">
                          {order.createdAt.toDate().toLocaleDateString("en-GB")}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-primary/40 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </div>

                  {/* ── Expanded body ── */}
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
                          {/* Contact & payment */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <Cell label="Phone" value={order.phone} />
                            <Cell label="WhatsApp" value={order.whatsapp} />
                            <Cell label="Payment" value={order.paymentMethod} />
                            {order.referenceNumber && (
                              <Cell
                                label="Reference #"
                                value={order.referenceNumber}
                              />
                            )}
                            {order.orangeReferenceNumber && (
                              <Cell
                                label="Orange Ref #"
                                value={order.orangeReferenceNumber}
                              />
                            )}
                            {order.orangeSenderPhone && (
                              <Cell
                                label="Orange Sender"
                                value={order.orangeSenderPhone}
                              />
                            )}
                          </div>

                          <Divider />

                          {/* Address */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <Cell label="City" value={order.city} />
                            <Cell label="Area" value={order.area} />
                            <Cell label="Floor" value={order.floor || "—"} />
                            <div className="col-span-2 sm:col-span-4">
                              <Cell label="Address" value={order.address} />
                            </div>
                          </div>

                          <Divider />

                          {/* Items */}
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary/40 mb-3">
                            Items
                          </h4>
                          <div className="flex flex-col gap-2 mb-4">
                            {order.items?.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 bg-accent rounded-xl p-3 border border-border"
                              >
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded-lg shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-dark text-[13px] truncate">
                                    {item.productName}
                                  </p>
                                  <p className="text-[11px] text-primary/50 mt-0.5">
                                    {item.quantity} × {item.price} EGP
                                  </p>
                                </div>
                                <span className="font-heading font-bold text-primary text-[14px] shrink-0">
                                  {item.total} EGP
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className="bg-accent border border-border rounded-xl p-4 mb-4 text-[13px]">
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
                              <span className="text-primary font-heading text-[16px]">
                                {order.grandTotal} EGP
                              </span>
                            </div>
                          </div>

                          <Divider />

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Status buttons */}
                            {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(order.id, s)}
                                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all
                                  ${
                                    order.status === s
                                      ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                                      : "bg-accent border-border text-primary/50 hover:border-primary/40"
                                  }`}
                              >
                                {cfg.label}
                              </button>
                            ))}

                            {/* WhatsApp confirm */}
                            <button
                              onClick={() => handleConfirmOrder(order)}
                              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold transition-colors ml-auto"
                            >
                              <svg
                                viewBox="0 0 32 32"
                                className="w-4 h-4"
                                fill="currentColor"
                              >
                                <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.486 2.031 7.788L0 32l8.418-2.007A15.937 15.937 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.76-1.845l-.485-.288-5.002 1.193 1.215-4.874-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.2-2.352-1.16-2.717-1.292-.364-.133-.63-.2-.895.2-.265.398-1.028 1.292-1.26 1.558-.232.265-.464.298-.862.1-.398-.2-1.682-.62-3.204-1.977-1.184-1.057-1.983-2.362-2.215-2.76-.232-.398-.025-.613.174-.811.179-.178.398-.464.597-.696.2-.232.265-.398.398-.663.133-.265.066-.497-.033-.696-.1-.2-.895-2.157-1.226-2.953-.323-.775-.651-.67-.895-.683-.232-.012-.497-.015-.762-.015-.265 0-.696.1-1.061.497-.364.398-1.393 1.36-1.393 3.316s1.426 3.847 1.625 4.113c.2.265 2.807 4.286 6.802 6.013.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.352-.961 2.684-1.89.332-.929.332-1.725.232-1.89-.1-.165-.364-.265-.762-.464z" />
                              </svg>
                              Confirm via WhatsApp
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => confirmDelete(order.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-[12px] font-bold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Empty state ── */}
        {currentOrders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🕯️</p>
            <p className="text-primary/40 font-heading text-lg">
              No orders found
            </p>
            <p className="text-primary/30 text-[13px] mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex gap-2 mt-6 justify-center flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-white border border-border text-[13px] text-primary font-semibold disabled:opacity-30 hover:border-primary/50 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-9 h-9 rounded-xl text-[13px] font-bold transition-colors ${
                  currentPage === i + 1
                    ? "bg-primary text-accent shadow-[0_2px_8px_rgba(147,97,55,0.3)]"
                    : "bg-white border border-border text-primary hover:border-primary/50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-white border border-border text-[13px] text-primary font-semibold disabled:opacity-30 hover:border-primary/50 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Toast popup ── */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-[14px] font-semibold
                ${popupType === "success" ? "bg-emerald-500" : "bg-red-500"}`}
            >
              <span className="text-lg">
                {popupType === "success" ? "✓" : "✕"}
              </span>
              {popupMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-xl">🗑</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-dark text-center mb-2">
                Delete Order?
              </h3>
              <p className="text-primary/50 text-[13px] text-center mb-6">
                This action cannot be undone. The order will be permanently
                removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-[14px] bg-accent border border-border text-primary hover:bg-primary/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-[14px] bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
