import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AnimatePresence, motion } from "framer-motion";

const STARS = [1, 2, 3, 4, 5];

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {STARS.map((s) => (
        <span key={s} className={s <= rating ? "text-primary" : "text-border"}>
          ★
        </span>
      ))}
    </div>
  );
}

function FeedbackCard({ fb, onDelete, onToggleApprove }) {
  const date = fb.createdAt?.toDate
    ? fb.createdAt.toDate()
    : new Date(fb.createdAt);
  const dateStr = isNaN(date)
    ? "—"
    : date.toLocaleDateString("en-EG", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-[20px] border border-border shadow-[0_2px_16px_rgba(147,97,55,0.07)] p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-[15px] font-bold text-dark">
            {fb.name}
          </p>
          <a
            href={`mailto:${fb.email}`}
            className="text-[12px] text-primary/70 hover:text-primary transition-colors"
          >
            ✉️ {fb.email}
          </a>
          <StarDisplay rating={fb.rating} />
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onToggleApprove(fb)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all cursor-pointer
              ${fb.approved ? "border-green-200 text-green-600 hover:bg-green-50" : "border-primary/20 text-primary/60 hover:bg-accent"}`}
          >
            {fb.approved ? "✅ Approved" : "⏳ Approve"}
          </button>
          <button
            onClick={() => onDelete(fb)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-[12px] font-medium hover:bg-red-50 transition-all cursor-pointer"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
      <div className="h-px bg-border" />
      <p className="font-body text-[13px] text-dark/80 leading-relaxed">
        "{fb.message}"
      </p>
      <p className="text-[11px] text-primary/40 font-body">🕐 {dateStr}</p>
    </motion.div>
  );
}

function ConfirmPopup({ feedback, onConfirm, onCancel }) {
  if (!feedback) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[24px] border border-border shadow-xl p-8 max-w-sm w-full text-center"
      >
        <span className="text-4xl mb-4 block">🗑️</span>
        <p className="font-heading text-xl font-bold text-dark mb-2">
          Delete Review?
        </p>
        <p className="text-[13px] text-primary/60 mb-6">
          Are you sure you want to delete the review from{" "}
          <span className="font-semibold text-dark">"{feedback.name}"</span>?
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
      </motion.div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-primary text-accent" : "bg-dark text-accent"}`}
    >
      <span className="text-lg">{toast.type === "success" ? "🕯️" : "❌"}</span>
      {toast.message}
    </div>
  );
}

export default function FeedbackDash() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const q = query(collection(db, "Feedbacks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeedbacks(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        showToast("Failed to load feedbacks", "error");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "Feedbacks", deleteTarget.id));
      showToast("Review deleted");
    } catch {
      showToast("Failed to delete review", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleToggleApprove(fb) {
    try {
      await updateDoc(doc(db, "Feedbacks", fb.id), { approved: !fb.approved });
      showToast(fb.approved ? "Review hidden" : "Review approved ✅");
    } catch {
      showToast("Failed to update review", "error");
    }
  }

  const filtered = feedbacks.filter((fb) => {
    const matchSearch =
      !search ||
      fb.name?.toLowerCase().includes(search.toLowerCase()) ||
      fb.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "approved" && fb.approved) ||
      (filter === "pending" && !fb.approved);
    return matchSearch && matchFilter;
  });

  const approvedCount = feedbacks.filter((f) => f.approved).length;
  const pendingCount = feedbacks.filter((f) => !f.approved).length;

  return (
    <div className="min-h-screen bg-accent py-10 px-4 sm:px-8 font-body">
      <Toast toast={toast} />
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmPopup
            feedback={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] text-primary font-semibold tracking-[0.16em] uppercase mb-1">
            Dashboard
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
            Feedbacks
          </h2>
          <div className="flex gap-4 mt-1">
            <p className="text-sm text-primary/60">{feedbacks.length} total</p>
            <p className="text-sm text-green-600">{approvedCount} approved</p>
            <p className="text-sm text-primary/40">{pendingCount} pending</p>
          </div>
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
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white text-dark placeholder:text-primary/30 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-6 flex gap-2">
        {["all", "approved", "pending"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer capitalize
              ${filter === f ? "bg-primary text-accent" : "bg-white border border-border text-primary/60 hover:border-primary"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <span className="text-5xl mb-4 block">⭐</span>
          <p className="font-heading text-xl font-bold text-dark">
            No reviews found
          </p>
          <p className="text-sm text-primary/50 mt-1">
            {search ? "Try a different search term." : "No reviews yet."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((fb) => (
              <FeedbackCard
                key={fb.id}
                fb={fb}
                onDelete={setDeleteTarget}
                onToggleApprove={handleToggleApprove}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
