import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { AppRoutes } from "./routes/AppRoutes";
import { SocketProvider } from "./providers/SocketProvider";
import "./styles/globals.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SocketProvider>
            <Suspense fallback={<div className="grid min-h-screen place-items-center text-primary-600">Loading PickFresh...</div>}>
              <AppRoutes />
            </Suspense>
          </SocketProvider>
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 3200,
              className: "rounded-lg",
              success: { duration: 2600 },
              error: { duration: 4200 },
              style: {
                border: "1px solid rgba(219, 230, 214, 0.9)",
                boxShadow: "0 16px 48px rgba(15, 23, 42, 0.12)",
                color: "#17201a",
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
