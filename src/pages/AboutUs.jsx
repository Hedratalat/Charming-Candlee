import { motion } from "framer-motion";
import aboutImg from "../../public/about.avif";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" },
  }),
};

export default function AboutUs() {
  const stats = [
    { num: "100%", label: "Natural Ingredients" },
    { num: "200+", label: "Signature Scents" },
    { num: "60h", label: "Avg. Burn Time" },
    { num: "Hand", label: "Poured Every Batch" },
  ];

  return (
    <>
      <Navbar />
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-20">
            {/* Left — Text */}
            <div className="flex-1 flex flex-col">
              <motion.span
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                className="hidden lg:block font-body text-xs tracking-[0.3em] uppercase text-primary "
              >
                Our Story
              </motion.span>

              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                className="font-heading text-4xl lg:text-6xl font-bold text-dark leading-tight -mt-6 sm:mt-4"
              >
                Crafted with{" "}
                <span className="text-primary italic">Passion</span>,
                <br />
                Lit with Purpose
              </motion.h2>

              {/* Divider */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={2}
                className="flex items-center gap-3 w-40 my-5"
              >
                <span className="h-[1px] flex-1 bg-primary opacity-40" />
                <span className="w-1.5 h-1.5 rotate-45 bg-primary opacity-60" />
                <span className="h-[1px] flex-1 bg-primary opacity-40" />
              </motion.div>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={3}
                className="font-body text-base text-dark/70 leading-relaxed max-w-lg"
              >
                Born from a love of slow mornings and warm evenings, Charming
                Candlee began as a small kitchen experiment — melting wax,
                blending botanicals, chasing the perfect scent. Today, every
                candle we pour carries that same intention: to bring stillness,
                beauty, and meaning into your everyday space.
              </motion.p>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={4}
                className="font-body text-base text-dark/70 leading-relaxed max-w-lg mt-4"
              >
                We use only natural soy wax, responsibly sourced botanicals, and
                hand-blended fragrance oils — because what fills your home
                should be as pure as the moments you create in it.
              </motion.p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-10 max-w-sm">
                {stats.map(({ num, label }, i) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={5 + i}
                    className="bg-white border border-primary/20 p-5"
                  >
                    <span className="font-heading text-3xl text-primary font-bold block leading-none">
                      {num}
                    </span>
                    <span className="font-body text-[10px] tracking-widest uppercase text-dark/50 mt-2 block">
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="flex-[0.8] flex flex-col items-center lg:items-end gap-4 w-full"
            >
              {/* Mobile Only Label */}
              <motion.span
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                className="block lg:hidden font-body text-xs tracking-[0.3em] uppercase text-primary self-start mb-1"
              >
                Our Story
              </motion.span>

              <div className="relative">
                <div
                  className="absolute border border-primary opacity-35"
                  style={{ top: 16, left: 16, right: -16, bottom: -16 }}
                />
                <div className="relative w-[clamp(260px,30vw,400px)] h-[clamp(360px,45vw,540px)] overflow-hidden shadow-2xl group">
                  <img
                    src={aboutImg}
                    alt="Our Story"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-dark/40 to-transparent" />
                </div>

                {/* Quote Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  className="absolute -right-6 bottom-8 bg-white px-5 py-4 border-l-[3px] border-primary z-10 max-w-[200px]"
                >
                  <p className="font-heading text-xs text-dark italic leading-relaxed">
                    "Every candle tells a story — let yours begin with light."
                  </p>
                  <span className="font-body text-[9px] tracking-widest uppercase text-dark/40 mt-2 block">
                    — Charming Candlee
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
