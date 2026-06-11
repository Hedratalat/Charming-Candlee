import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function LoginDash() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      setIsGoogleLoading(true);
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;

        const user = result.user;
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            fullName: user.displayName || "",
            email: user.email || "",
            phone: "",
            createdAt: new Date().toString(),
            emailVerified: true,
          });
          toast.success(`Welcome, ${user.displayName || "User"}`);
        } else {
          await updateDoc(userRef, { emailVerified: true });
          toast.success(`Welcome back, ${user.displayName || "User"}`);
        }

        navigate("/dashboard");
      } catch (error) {
        console.error(error);
        toast.error("Google sign-in failed. Try again.");
      } finally {
        setIsGoogleLoading(false);
      }
    };

    checkRedirect();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  return (
    <div className="min-h-screen bg-accent font-body flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 rotate-[-15deg]">
          🕯️
        </div>
        <div className="absolute top-40 right-16 text-4xl opacity-10 rotate-[10deg]">
          ✨
        </div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-10 rotate-[5deg]">
          🌿
        </div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 rotate-[-8deg]">
          🕯️
        </div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white border border-border rounded-[28px] shadow-[0_8px_40px_rgba(61,31,10,0.10)] px-8 py-10">
          {/* Candle icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-3xl">
              🕯️
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-[28px] font-bold text-dark mb-1">
              Dashboard
            </h1>
            <p className="text-[13px] text-primary/50">
              Sign in to manage your store
            </p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-accent border border-border
              rounded-2xl py-3.5 mb-4 hover:border-primary/40 hover:bg-white
              transition-all duration-200 font-semibold text-[14px] text-dark
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-[0_2px_8px_rgba(61,31,10,0.06)]"
          >
            <FcGoogle size={22} />
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-primary/30 font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Back home */}
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-2xl border border-border text-primary/60
              text-[14px] font-semibold hover:bg-accent hover:text-primary transition-colors"
          >
            ← Back to Store
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-primary/30 mt-6">
          🕯️ Charming Candlee · Admin Access Only
        </p>
      </div>
    </div>
  );
}
