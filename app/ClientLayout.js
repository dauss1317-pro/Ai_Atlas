"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DM_Sans } from "next/font/google";
import SplashScreen from "./components/Splashscreen";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={`${dmSans.className} antialiased`}>
      {loading && <SplashScreen />}
      <div style={{ filter: loading ? "blur(2px)" : "none", transition: "filter 0.3s" }}>
        {children}
      </div>
    </div>
  );
}
