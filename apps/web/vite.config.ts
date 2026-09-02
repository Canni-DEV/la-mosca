import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === "build" ? "/la-mosca/" : "/",
  server: {
    port: 5173,
  },
}));
