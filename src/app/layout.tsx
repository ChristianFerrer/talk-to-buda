import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Habla con Buda — Un espacio de reflexión y calma",
  description: "Conversa con una inteligencia artificial inspirada en la sabiduría de Buda. Encuentra calma, claridad y reflexión a través de WhatsApp.",
  keywords: ["buda", "meditación", "reflexión", "bienestar", "WhatsApp", "IA", "mindfulness"],
  openGraph: {
    title: "Habla con Buda",
    description: "Un espacio simple para conversar y encontrar claridad a través de la sabiduría de Buda.",
    type: "website",
    siteName: "Habla con Buda",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habla con Buda",
    description: "Conversa por WhatsApp con una IA inspirada en la sabiduría de Buda.",
  },
  icons: {
    icon: "/lotus1.png",
    apple: "/lotus1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-warm-50 text-gray-800`}
      >
        {children}
      </body>
    </html>
  );
}
