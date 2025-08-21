import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Poppins } from "next/font/google";
import { DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast"; // ✅ Import Toaster

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ai Atlas",
  description: "Stylish login page with PWA support",
  manifest: "/manifest.json",
};

export function generateViewport() {
  return {
    themeColor: "#1f2e6b",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="black"
        />
        {/* ✅ Favicon */}
        {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}

      </head>
      <body className={`${dmSans.className} antialiased`}>
        {children}
        <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Toast here */}
      </body>
    </html>
  );
}
