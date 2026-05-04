import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </ToastProvider>,
);
