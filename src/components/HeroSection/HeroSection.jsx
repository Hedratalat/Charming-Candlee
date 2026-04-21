import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" },
  }),
};

export default function HeroSection() {
  return (
    <section className="bg-accent flex items-center overflow-hidden py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left - Text */}
          <div className="flex-[1.2] flex flex-col gap-6 justify-center items-center text-center lg:items-start lg:text-left w-full">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="font-body text-sm tracking-[0.3em] uppercase text-primary"
            >
              Luxury Candles & Scents
            </motion.span>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-dark leading-tight max-w-2xl"
            >
              Light Up Your <span className="text-primary italic">Moments</span>
            </motion.h1>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex items-center gap-3 w-40"
            >
              <span className="h-[1px] flex-1 bg-primary opacity-40" />
              <span className="w-1.5 h-1.5 rotate-45 bg-primary opacity-60" />
              <span className="h-[1px] flex-1 bg-primary opacity-40" />
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="font-body text-base sm:text-lg text-dark/70 leading-relaxed max-w-xl"
            >
              Handcrafted candles made with the finest ingredients to bring
              warmth, elegance, and unforgettable scents into your space.
            </motion.p>

            {/* Features */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 mt-2 w-full"
            >
              {[
                { icon: "❋", label: "Made with Love" },
                { icon: "✦", label: "Natural Wax" },
                { icon: "❈", label: "Premium Quality" },
                { icon: "◈", label: "60h Burn" },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-full
                   border border-primary/30 bg-primary/5 font-body text-sm tracking-wide text-dark/70 text-center"
                >
                  <span className="text-xs">{icon}</span>
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="grid grid-cols-2 lg:flex gap-3 mt-4 w-full lg:w-auto"
            >
              <Link
                to="/products"
                className="whitespace-nowrap group relative inline-flex items-center justify-center
                 px-6 py-3 lg:px-10 lg:py-4 overflow-hidden font-body font-semibold text-xs sm:text-sm tracking-[0.25em] uppercase text-white bg-primary rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <span className="relative z-10">Shop Now</span>
                <span className="absolute inset-0 bg-dark scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="relative z-10 ml-3 w-5 h-[1px] bg-white transition-all duration-300 group-hover:w-7 after:content-[''] after:absolute after:right-0 after:top-[-4px] after:w-2 after:h-2 after:border-r-2 after:border-t-2 after:border-white after:rotate-45" />
              </Link>

              <Link
                to="/about"
                className="whitespace-nowrap group relative inline-flex items-center justify-center px-6 py-3 lg:px-10 lg:py-4
                 overflow-hidden font-body font-semibold text-xs  sm:text-sm tracking-[0.25em] uppercase text-primary border border-primary rounded-full transition-all duration-300 hover:text-white hover:shadow-lg"
              >
                <span className="relative z-10">Our Story</span>
                <span className="absolute inset-0 bg-primary scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="relative z-10 ml-3 w-5 h-[1px] bg-current transition-all duration-300 group-hover:w-7 after:content-[''] after:absolute after:right-0 after:top-[-4px] after:w-2 after:h-2 after:border-r-2 after:border-t-2 after:border-current after:rotate-45" />
              </Link>
            </motion.div>
          </div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="flex-[0.8] flex justify-center lg:justify-end items-center"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute border border-primary"
                style={{
                  top: "16px",
                  left: "16px",
                  right: "-16px",
                  bottom: "-16px",
                }}
              />

              <div className="relative w-[clamp(260px,30vw,380px)] h-[clamp(340px,40vw,500px)] overflow-hidden shadow-2xl group">
                <img
                  src="https://img.freepik.com/premium-photo/burning-candle-festive-cozy-atmosphere_206268-8487.jpg"
                  alt="Luxury Candle"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-dark/45 to-transparent" />
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
                className="absolute -left-10 bottom-8 bg-white px-5 py-4 shadow-xl border-l-[3px] border-primary z-10"
              >
                <span
                  className="text-3xl text-primary font-bold block leading-none tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  200+
                </span>
                <span className="font-body text-[9px] tracking-widest uppercase text-dark opacity-50 mt-1 block">
                  Unique Scents
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
