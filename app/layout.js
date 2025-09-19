import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "./components/ToasterProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "Ai Atlas",
  description: "Stylish login page with PWA support",
  manifest: "/manifest.json",
};

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
      </head>
      <body className={`${dmSans.variable} antialiased`}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
