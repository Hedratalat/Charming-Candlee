import {
  FaFacebookF,
  FaWhatsapp,
  FaTiktok,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Home", to: "/" },
  { name: "About", to: "/about" },
  { name: "Products", to: "/products" },
  { name: "My Orders", to: "/myorders" },
  { name: "Contact", to: "/contact" },
];

const socials = [
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
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-11 pb-7 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="font-heading text-2xl font-bold text-white tracking-[0.15em] leading-none mb-2">
              Charming Candlee
            </div>

            <p className="font-body text-sm text-white leading-relaxed mb-4 mt-2">
              Handcrafted luxury scented candles, made with love in Egypt,
              blending artistry and fragrance to create a truly luxurious
              experience.
            </p>

            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-primary opacity-70" />
              <span className="font-body text-xs text-white tracking-wide">
                Est. 2024 · Cairo, Egypt
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
              Navigation
            </p>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.name} className="flex items-center gap-2 group">
                  <span className="h-px w-4 bg-primary opacity-50 group-hover:w-6 group-hover:opacity-90 transition-all duration-200" />
                  <Link
                    to={link.to}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="font-body text-sm text-white hover:text-white/80 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
              Contact
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-white text-sm justify-center md:justify-start">
                <FaMapMarkerAlt size={16} className="text-primary/70" />
                Cairo, Egypt
              </div>

              <a
                href="tel:+201213328280"
                className="flex items-center gap-3 text-white text-sm hover:text-white/80 transition-colors duration-200 justify-center md:justify-start"
              >
                <FaPhone size={15} className="text-primary/70" />
                +20 121 332 8280
              </a>

              <a
                href="mailto:charmingcandlee@gmail.com"
                className="flex items-center gap-3 text-white text-sm hover:text-white/80 transition-colors duration-200 justify-center md:justify-start"
              >
                <FaEnvelope size={16} className="text-primary/70" />
                charmingcandlee@gmail.com
              </a>
            </div>
          </div>

          {/* Hours + Socials */}
          <div className="flex flex-col items-center md:items-start">
            <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">
              Hours
            </p>

            <div className="flex flex-col divide-y divide-white/[0.07] w-full max-w-[220px]">
              <div className="py-2 text-sm flex flex-col  sm:items-start items-center gap-1">
                <span className="text-white">All Days</span>
                <span className="text-white font-medium">Open 24/7</span>
              </div>
            </div>

            <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-primary mt-6 mb-3">
              Follow us
            </p>

            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              {socials.map(({ Icon, href, title }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="w-10 h-10 flex items-center justify-center rounded-lg
                             bg-white/[0.06] border border-white/[0.15] text-white
                             hover:bg-primary/30 hover:border-primary 
                             hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.08] mb-5" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-body text-xs text-white/70 order-2 md:order-1">
            © {new Date().getFullYear()} Charming Candlee · All rights reserved.
          </p>
          <p className="font-body text-xs text-white/70 tracking-wide order-1 md:order-2">
            Made with love in Egypt
          </p>
        </div>
      </div>
    </footer>
  );
}
