import { FiLogOut } from "react-icons/fi";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

export default function NavBarDash({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:");
    }
  };

  return (
    <nav className="bg-dark text-white z-40 shadow-md border-b border-primary">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
        {/* زر القائمة للموبايل */}
        <button
          onClick={onMenuClick}
          className="lg:hidden bg-primary p-2 rounded-md hover:bg-primary/80 transition text-white"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-lg sm:text-2xl font-heading font-semibold text-white">
          Welcome Admin
        </h2>

        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-2
           bg-primary text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-lg
            hover:bg-primary/80 transition"
        >
          Logout
          <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </nav>
  );
}
