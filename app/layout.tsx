import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import Header from "components/header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Auto Eléctrica RB",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Auto Eléctrica RB",
  },
  themeColor: "#0b0b0f",
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <RegisterSW />
        <Header />
        {children}
      </body>
    </html>
  );
}
