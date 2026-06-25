import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { AppRoutes } from "./routes/AppRoutes";
import "./styles/globals.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<div className="grid min-h-screen place-items-center text-primary-600">Loading PickFresh...</div>}>
            <AppRoutes />
          </Suspense>
          <Toaster position="top-right" toastOptions={{ className: "rounded-2xl" }} />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
