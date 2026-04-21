import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { z } from "zod";
import Navbar from "../components/Navbar/Navbar";
import { db } from "../../firebase";
import Footer from "../components/Footer/Footer";

// Zod Schema
const contactSchema = z.object({
  fullName: z
    .string()
    .min(3, "Please enter a valid name.")
    .max(50, "Please enter a valid name.")
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, "Name should only contain letters"),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .refine(
      (val) => {
        const lowerVal = val.toLowerCase();
        return /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.(com|net|org)(\.eg)?$/.test(
          lowerVal,
        );
      },
      { message: "Email must be a valid Gmail address" },
    ),
  phone: z
    .string()
    .regex(/^(\+2)?01[0125][0-9]{8}$/, "Phone must be a valid Egyptian number"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

//  Decorative SVG ornament
const Ornament = () => (
  <svg
    width="60"
    height="12"
    viewBox="0 0 60 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line
      x1="0"
      y1="6"
      x2="22"
      y2="6"
      stroke="#936137"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
    <circle cx="30" cy="6" r="4" fill="#936137" fillOpacity="0.6" />
    <line
      x1="38"
      y1="6"
      x2="60"
      y2="6"
      stroke="#936137"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
  </svg>
);

// Field component
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-[0.78rem] font-semibold tracking-widest uppercase text-primary">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-body text-[0.78rem] text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// Input class helper
const inputClass = (hasError) =>
  `w-full px-4 py-3 bg-accent/60 rounded-md font-body text-[0.95rem] text-dark outline-none
   transition-all duration-200 border-[1.5px]
   ${hasError ? "border-red-600" : "border-primary/25"}
   focus:border-primary focus:shadow-[0_0_0_3px_rgba(147,97,55,0.12)]`;

// Main Component
export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

  const bannerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if ((sent || firebaseError) && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sent, firebaseError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setErrors({});
    setFirebaseError(false);
    setIsSubmitting(true);

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "Messages"), {
        ...formData,
        sentAt: serverTimestamp(),
      });
      setSent(true);
      setFormData({ fullName: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("error:");
      setFirebaseError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-accent via-[#fdf3e8] to-[#f7e8d4] pt-12 pb-16">
        <div className="max-w-[920px] mx-auto px-4">
          {/*  Success Banner */}
          <AnimatePresence>
            {sent && (
              <motion.div
                ref={bannerRef}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex items-start gap-4 bg-white border border-green-200 rounded-2xl px-6 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
              >
                <span className="text-2xl mt-0.5">✅</span>
                <div>
                  <p className="font-heading text-[1.1rem] font-bold text-dark mb-0.5">
                    Message sent successfully!
                  </p>
                  <p className="font-body text-[0.9rem] text-[#7a5c3e]">
                    Thank you for reaching out. We'll get back to you as soon as
                    possible.
                  </p>
                </div>
                <button
                  onClick={() => setSent(false)}
                  className="ml-auto text-[#7a5c3e]/50 hover:text-dark text-lg leading-none transition-colors"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner  */}
          <AnimatePresence>
            {firebaseError && (
              <motion.div
                ref={bannerRef}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex items-start gap-4 bg-white border border-red-200 rounded-2xl px-6 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
              >
                <span className="text-2xl mt-0.5">❌</span>
                <div>
                  <p className="font-heading text-[1.1rem] font-bold text-dark mb-0.5">
                    Something went wrong!
                  </p>
                  <p className="font-body text-[0.9rem] text-[#7a5c3e]">
                    We couldn't send your message. Please try again or contact
                    us directly.
                  </p>
                </div>
                <button
                  onClick={() => setFirebaseError(false)}
                  className="ml-auto text-[#7a5c3e]/50 hover:text-dark text-lg leading-none transition-colors"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/*  Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="font-body text-[0.75rem] font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Get in Touch
            </p>
            <h1 className="font-heading text-[clamp(2rem,5vw,3.2rem)] font-bold text-dark leading-tight mb-3">
              Contact Us
            </h1>
            <div className="flex justify-center mb-4">
              <Ornament />
            </div>
            <p className="font-body text-[1rem] text-[#7a5c3e] max-w-[440px] mx-auto leading-relaxed">
              You can reach out to us anytime — we're happy to help.
            </p>
          </motion.div>

          {/*  Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/*  Form Card  */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="bg-white/75 backdrop-blur-md border border-primary/15 rounded-2xl p-9 shadow-[0_8px_40px_rgba(147,97,55,0.08)]"
            >
              <form
                onSubmit={handleSend}
                noValidate
                className="flex flex-col gap-5"
              >
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    type="text"
                    name="fullName"
                    data-gramm="false"
                    data-gramm_editor="false"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass(!!errors.fullName)}
                  />
                </Field>

                <Field label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    data-gramm="false"
                    data-gramm_editor="false"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass(!!errors.email)}
                  />
                </Field>

                <Field label="Phone Number" error={errors.phone}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass(!!errors.phone)}
                  />
                </Field>

                <Field label="Message" error={errors.message}>
                  <textarea
                    name="message"
                    data-gramm="false"
                    data-gramm_editor="false"
                    rows={5}
                    placeholder="Write your message..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`${inputClass(!!errors.message)} resize-none`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 text-white rounded-md font-body font-bold text-[0.88rem] tracking-[0.12em] uppercase transition-all duration-300 mt-1
                    ${
                      isSubmitting
                        ? "bg-primary/50 cursor-not-allowed"
                        : "bg-primary hover:bg-dark cursor-pointer"
                    }`}
                >
                  {isSubmitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            </motion.div>

            {/* Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="bg-dark rounded-2xl p-9 shadow-[0_8px_40px_rgba(61,31,10,0.25)] flex flex-col gap-7"
            >
              <div>
                <p className="font-body text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-white/60 mb-2">
                  Information
                </p>
                <h3 className="font-heading text-[1.65rem] font-bold text-white leading-snug mb-2.5">
                  Contact Information
                </h3>
                <div className="w-10 h-0.5 bg-white/40 rounded-full" />
              </div>

              <p className="font-body text-[0.92rem] text-white/70 leading-relaxed">
                Choose your preferred method below, and we'll respond as quickly
                as possible.
              </p>

              <div className="flex flex-col gap-5">
                {[
                  { icon: "📍", label: "Address", value: "Cairo, Egypt" },
                  {
                    icon: "📞",
                    label: "Phone",
                    value: "+201213328280",
                    href: "tel:+201213328280",
                  },
                  {
                    icon: <FaEnvelope className="text-white" />,
                    label: "Email",
                    value: "charmingcandlee@gmail.com",
                    href: "mailto:charmingcandlee@gmail.com",
                  },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3.5">
                    <span className="text-lg mt-0.5">{icon}</span>
                    <div>
                      <p className="font-body text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-white/60 mb-0.5">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="font-body text-[0.95rem] text-white/90 hover:text-white transition-colors duration-200"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="font-body text-[0.95rem] text-white/90">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-primary/30" />

              <div>
                <p className="font-body text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-white/60 mb-4">
                  Follow Us
                </p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    {
                      Icon: FaFacebookF,
                      href: "https://www.facebook.com/share/1JDyeR4yNj/?mibextid=wwXIfr",
                      title: "Facebook",
                    },
                    {
                      Icon: FaWhatsapp,
                      href: "https://api.whatsapp.com/send/?phone=201213328280",
                      title: "WhatsApp",
                    },
                    {
                      Icon: FaTiktok,
                      href: "https://www.tiktok.com/@charming_candlee?_r=1&_t=ZS-9584LNxaOBN",
                      title: "TikTok",
                    },
                    {
                      Icon: FaInstagram,
                      href: "https://www.instagram.com/charming_candlee?igsh=Nzhnb3kxbnkwcHB1",
                      title: "Instagram",
                    },
                  ].map(({ Icon, href, title }) => (
                    <a
                      key={title}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={title}
                      className="w-11 h-11 flex items-center justify-center bg-white/15 border border-white/30 rounded-lg text-white
                                 hover:bg-white/30 hover:border-white/60 hover:-translate-y-1 transition-all duration-200"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
