import type { Metadata, Viewport } from "next";
import "./globals.css";

// NOTA: en producción/dev real con internet, sustituir el bloque de abajo por:
//   import { Anton, Fredoka } from "next/font/google";
//   const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
//   const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["400","500","600","700"] });
// Y aplicar `${anton.variable} ${fredoka.variable}` en <html>.
// El sandbox de desarrollo aquí no tiene acceso a fonts.googleapis.com, por eso usamos system fonts.

export const metadata: Metadata = {
  title: "Beast Games",
  description: "App de matemáticas con escalera de premios",
  applicationName: "Beast Games",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Beast",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0814",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
