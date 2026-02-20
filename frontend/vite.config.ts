import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:4000",
      "/users": "http://localhost:4000",
      "/workouts": "http://localhost:4000",
      "/analytics": "http://localhost:4000"
    }
  }
});

