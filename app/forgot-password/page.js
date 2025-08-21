"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // for logo/icon

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 3000); // start fade after 1.5s
  
      const hideTimer = setTimeout(() => {
        setShowSplash(false);
      }, 3500); // fully hide after 2s
  
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }, []);

    if (showSplash) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-indigo-700 transition-opacity duration-500 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`} style={{ backgroundColor: "#1f2e6b", backgroundImage: 'url(/backgorund-image3.png)', backgroundSize: "cover"}}
      >
        {/* App Icon */}
        <Image
          src="/favicon.ico" // put your icon inside public/icon.png
          alt="App Logo"
          width={100}
          height={100}
          className="mb-4 animate-bounce"
        />

        {/* App Name */}
        <h1 className="text-white text-3xl font-bold mb-3">
          Ai Atlas
        </h1>

        {/* Loading Dots Animation */}
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
          <span
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Example API call to send reset email
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.ok) {
        setMessage("If that email is registered, you will receive a password reset link shortly.");
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4" style={{ backgroundColor: "#1f2e6b", backgroundImage: 'url(/bg1.jpg)', backgroundSize: "cover"}}>
      <div className="bg-white backdrop-blur-md rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter your email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
