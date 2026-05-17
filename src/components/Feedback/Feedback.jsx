import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const STARS = [1, 2, 3, 4, 5];

const feedbackSchema = z.object({
  name: z
    .string()
    .nonempty("Please fill in all fields")
    .min(3, "Name must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z\s]+$/, "Letters and spaces only"),
  email: z
    .string()
    .nonempty("Please fill in all fields")
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Invalid email address",
    }),
  message: z
    .string()
    .nonempty("Please fill in all fields")
    .min(10, "Message must be at least 10 characters")
    .max(400),
  rating: z
    .number({ invalid_type_error: "Please select a rating" })
    .min(1, "Please select a rating"),
});

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

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [success, setSuccess] = useState(false);
  const visibleCount = 3;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    mode: "onChange",
    defaultValues: { rating: 0 },
  });

  useEffect(() => {
    const q = query(collection(db, "Feedbacks"), where("approved", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(all);
      setStartIndex(0);
    });
    return () => unsubscribe();
  }, []);

  const handlePrev = () =>
    setStartIndex((prev) => Math.max(prev - visibleCount, 0));

  const handleNext = () =>
    setStartIndex((prev) =>
      Math.min(prev + visibleCount, feedbacks.length - visibleCount),
    );

  const visibleFeedbacks = feedbacks.slice(
    startIndex,
    startIndex + visibleCount,
  );

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, "Feedbacks"), {
        name: data.name,
        email: data.email,
        message: data.message,
        rating: data.rating,
        approved: false,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      reset();
      setRating(0);
    } catch {}
  };

  return (
    <section className="font-body bg-accent py-14 px-6 lg:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-dark leading-tight">
          Leave a Review
        </h2>
        <p className="mt-3 text-[14px] text-primary/50 max-w-md mx-auto">
          We'd love to hear what you think about our candles.
        </p>
      </motion.div>
      <div className="max-w-7xl mx-auto">
        {/* Slider */}
        {feedbacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative mb-12"
          >
            {" "}
            <button
              onClick={handlePrev}
              disabled={startIndex === 0}
              className="absolute -left-6 lg:-left-10 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-primary/50 hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 12L6 8l4-4" />
              </svg>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {visibleFeedbacks.map((fb) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-border rounded-[20px] p-5 flex flex-col gap-3 shadow-sm"
                  >
                    <StarDisplay rating={fb.rating} />
                    <p className="text-[14px] text-dark/80 leading-relaxed flex-1">
                      "{fb.message}"
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px]">
                        {fb.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <p className="text-[13px] font-semibold text-dark">
                        {fb.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              onClick={handleNext}
              disabled={startIndex + visibleCount >= feedbacks.length}
              className="absolute -right-6 lg:-right-10 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-primary/50 hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto bg-white border border-border rounded-[20px] p-10 text-center"
            >
              <span className="text-5xl mb-4 block">🕯️</span>
              <p className="font-heading text-xl font-bold text-dark mb-1">
                Thank you
              </p>
              <p className="text-[13px] text-primary/50">
                Your review has been submitted and is awaiting approval.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 text-[13px] text-primary underline cursor-pointer"
              >
                Submit another review
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-xl mx-auto bg-white border border-border rounded-[20px] p-8 flex flex-col gap-5"
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-primary font-semibold tracking-[0.12em] uppercase">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-accent text-dark placeholder:text-primary/30 focus:outline-none transition-colors ${
                    errors.name
                      ? "border-red-400"
                      : "border-border focus:border-primary"
                  }`}
                />
                {errors.name && (
                  <p className="text-[12px] text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-primary font-semibold tracking-[0.12em] uppercase">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-accent text-dark placeholder:text-primary/30 focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-400"
                      : "border-border focus:border-primary"
                  }`}
                />
                {errors.email && (
                  <p className="text-[12px] text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-primary font-semibold tracking-[0.12em] uppercase">
                  Rating
                </label>
                <div className="flex gap-1.5">
                  {STARS.map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        setRating(star);
                        setValue("rating", star);
                      }}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="text-2xl cursor-pointer transition-transform hover:scale-110"
                    >
                      <span
                        className={
                          star <= (hovered || rating)
                            ? "text-primary"
                            : "text-border"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-[12px] text-red-500">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-primary font-semibold tracking-[0.12em] uppercase">
                  Your Review
                </label>
                <textarea
                  placeholder="Tell us about your experience…"
                  rows={4}
                  {...register("message")}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-accent text-dark placeholder:text-primary/30 focus:outline-none transition-colors resize-none ${
                    errors.message
                      ? "border-red-400"
                      : "border-border focus:border-primary"
                  }`}
                />
                {errors.message && (
                  <p className="text-[12px] text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-accent text-[14px] font-semibold py-3.5 rounded-xl cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit Review"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
