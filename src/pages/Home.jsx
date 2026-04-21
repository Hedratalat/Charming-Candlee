import { lazy, Suspense } from "react";
import Footer from "../components/Footer/Footer";

const Navbar = lazy(() => import("../components/Navbar/Navbar"));
const HeroSection = lazy(() => import("../components/HeroSection/HeroSection"));

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Navbar />
      <HeroSection />
      <Footer />
    </Suspense>
  );
}
