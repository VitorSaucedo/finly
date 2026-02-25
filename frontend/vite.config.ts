import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Em dev (npm run dev), VITE_API_URL não é definido.
// O proxy abaixo redireciona /api → backend na porta 8080 automaticamente.
//
// Em prod (Render), VITE_API_URL é definido como env var no painel do Render
// antes do build, e o proxy é ignorado (não existe em arquivos estáticos).

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
