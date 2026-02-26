import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthTokenProvider } from "./domains/auth/AuthTokenContext";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import App from "./app/App";
import "./index.css";

const queryClient = new QueryClient();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthTokenProvider>
            <App />
          </AuthTokenProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
