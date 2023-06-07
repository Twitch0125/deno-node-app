import { defineConfig, presetWebFonts } from "unocss";
export default defineConfig({
  presets: [presetWebFonts({
    fonts: {
      sans: "DM Sans",
      mono: "JetBrains Mono",
    },
  })],
});
