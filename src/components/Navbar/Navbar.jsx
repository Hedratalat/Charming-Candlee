import { FaHeart, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const navLinks = [
  { name: "Home", to: "/" },
  { name: "About", to: "/about" },
  { name: "Products", to: "/products" },
  { name: "My Orders", to: "/myorders" },
  { name: "Contact", to: "/contact" },
];

function Icon({ icon: Icon, onClick, size = 24 }) {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Icon
        size={size}
        className="hover:text-primary transition-colors duration-300"
      />
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white/70 shadow sticky top-0 w-full z-50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-2 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="cursor-pointer shrink-0 flex flex-col items-center leading-none"
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="font-heading text-3xl font-bold text-dark tracking-[0.15em]">
              Charming
            </span>
            <div className="flex items-center gap-2 w-full">
              <span className="h-[1px] flex-1 bg-primary opacity-50" />
              <span className="font-heading text-xs font-normal text-dark tracking-[0.4em] uppercase">
                Candlee
              </span>
              <span className="h-[1px] flex-1 bg-primary opacity-50" />
            </div>
          </div>

          {/* Desktop Links + Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <ul className="flex items-center space-x-6 font-heading font-bold text-dark text-base lg:text-xl">
              {navLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.to}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="hover:text-primary hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-4 text-dark text-xl">
              <Icon icon={FaHeart} onClick={() => navigate("/favorites")} />
              <Icon icon={FaShoppingCart} onClick={() => navigate("/cart")} />
            </div>
          </div>

          {/* Mobile Icons + Burger */}
          <div className="lg:hidden flex items-center gap-3 text-dark">
            <Icon
              icon={FaHeart}
              onClick={() => navigate("/favorites")}
              size={22}
            />
            <Icon
              icon={FaShoppingCart}
              onClick={() => navigate("/cart")}
              size={22}
            />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md text-dark hover:text-primary transition-colors"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <ul className="lg:hidden flex flex-col items-center space-y-4 py-4 font-heading font-bold text-dark text-xl mb-2">
            {navLinks.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.to}
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
