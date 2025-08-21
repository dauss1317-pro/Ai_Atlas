"use client"; // make sure this page is client component

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import Chatbot from "../components/Chatbot";

export default function Dashboard() {
  const router = useRouter();


  useEffect(() => {
    // Example: check token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");  // redirect to login if no token
    }
  }, [router]);

  return (
    <DashboardLayout>
      <Chatbot />
    </DashboardLayout>
  );
}

