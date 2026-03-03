import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "BIP39 Offline Wallet Tool",
        short_name: "BIP39 Offline",
        description:
          "Ferramenta local e offline para operações de mnemonic/seed no browser.",
        theme_color: "#1f7a8c",
        background_color: "#f6f7f4",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "vite.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,png,svg,ico,json}"],
      },
    }),
  ],
});
