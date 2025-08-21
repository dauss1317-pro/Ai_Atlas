"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; // for logo/icon

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Registration failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.ok) {
        // Registration successful, redirect to login or dashboard
        window.location.href = "/"; // or "/dashboard" if auto-login
      } else {
        setError(data.error || "Registration failed");
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
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            🚀
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Ai Atlas
        </h3>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Create an Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Sign up to get started
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/" className="text-blue-500 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
