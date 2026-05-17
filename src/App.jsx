import { lazy, Suspense } from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Products = lazy(() => import("./pages/Products"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Cart = lazy(() => import("./pages/Cart"));
const DashBoardLayout = lazy(
  () => import("./components/DashboardLayout/DashboardLayout"),
);

const AddProducts = lazy(() => import("./pages/AddProducts"));
const ManageProducts = lazy(() => import("./pages/ManageProducts"));
const MessageDash = lazy(() => import("./pages/MessageDash"));
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
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            {/* //dashboard */}
            <Route
              path="/dashboard"
              element={
                // <ProtectedRoute>
                <DashBoardLayout />
                // </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="addProducts" replace />} />
              <Route path="addProducts" element={<AddProducts />} />
              <Route path="ManageProducts" element={<ManageProducts />} />
              {/* <Route path="Feedback" element={<FeedbackDash />} /> */}
              <Route path="message" element={<MessageDash />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
