import { lazy, Suspense } from "react";

const Navbar = lazy(() => import("../components/Navbar/Navbar"));
const HeroSection = lazy(() => import("../components/HeroSection/HeroSection"));
const BestSellers = lazy(() => import("../components/BestSeller/BestSellers"));
const CategoryHome = lazy(
  () => import("../components/CategoryHome/CategoryHome"),
);
const Feedback = lazy(() => import("../components/Feedback/Feedback"));
const Footer = lazy(() => import("../components/Footer/Footer"));

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Navbar />
      <HeroSection />
      <CategoryHome />
      <BestSellers />
      <Feedback />
      <Footer />
    </Suspense>
  );
}
