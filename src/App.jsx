import { lazy, Suspense } from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Products = lazy(() => import("./pages/Products"));
function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
