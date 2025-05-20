import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <LanguageProvider>
          <ThemeProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ThemeProvider>
        </LanguageProvider>
      </HelmetProvider>
    </I18nextProvider>
  </QueryClientProvider>
);
