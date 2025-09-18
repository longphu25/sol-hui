import localFont from "next/font/local";

// Pixeloid Font Configuration
const pixeloidSans = localFont({
  src: [
    {
      path: "../../public/fonts/PixeloidSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PixeloidSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pixeloid-sans",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const pixeloidMono = localFont({
  src: "../../public/fonts/PixeloidMono-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-pixeloid-mono",
  display: "swap",
  fallback: ["Courier New", "monospace"],
});

// Font class names for easy usage
export const fontClasses = {
  sans: pixeloidSans.className,
  mono: pixeloidMono.className,
  variable: `${pixeloidSans.variable} ${pixeloidMono.variable}`,
};
