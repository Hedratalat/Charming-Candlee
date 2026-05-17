import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AnimatePresence, motion } from "framer-motion";

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

// ── Confirm Delete Popup ───────────────────────────────────────────────────────
function ConfirmPopup({ message, onConfirm, onCancel }) {
  if (!message) return null;
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
          Delete Message?
        </p>
        <p className="text-[13px] text-primary/60 mb-6">
          Are you sure you want to delete the message from{" "}
          <span className="font-semibold text-dark">"{message.fullName}"</span>?
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

// ── Message Card ───────────────────────────────────────────────────────────────
function MessageCard({ msg, onDelete }) {
  const date = msg.sentAt?.toDate ? msg.sentAt.toDate() : new Date(msg.sentAt);
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
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="font-heading text-[15px] font-bold text-dark leading-tight">
            {msg.fullName}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <a
              href={`mailto:${msg.email}`}
              className="text-[12px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
            >
              ✉️ {msg.email}
            </a>
            <a
              href={`tel:${msg.phone}`}
              className="text-[12px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
            >
              📞 {msg.phone}
            </a>
          </div>
        </div>

        <button
          onClick={() => onDelete(msg)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-[12px] font-medium hover:bg-red-50 transition-all cursor-pointer"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Message body */}
      <p className="font-body text-[13px] text-dark/80 leading-relaxed">
        {msg.message}
      </p>

      {/* Footer */}
      <p className="text-[11px] text-primary/40 font-body">🕐 {dateStr}</p>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MessageDash() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const q = query(collection(db, "Messages"), orderBy("sentAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        showToast("Failed to load messages", "error");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "Messages", deleteTarget.id));
      showToast("Message deleted");
    } catch {
      showToast("Failed to delete message", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  const filtered = messages.filter(
    (m) =>
      !search ||
      m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-accent py-10 px-4 sm:px-8 font-body">
      <Toast toast={toast} />

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmPopup
            message={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] text-primary font-semibold tracking-[0.16em] uppercase mb-1">
            Dashboard
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
            Messages
          </h1>
          <p className="text-sm text-primary/60 mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Search */}
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

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-24">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="font-heading text-xl font-bold text-dark">
            No messages found
          </p>
          <p className="text-sm text-primary/50 mt-1">
            {search
              ? "Try a different search term."
              : "No messages have been submitted yet."}
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && filtered.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((msg) => (
              <MessageCard key={msg.id} msg={msg} onDelete={setDeleteTarget} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
