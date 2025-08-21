"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // for logo/icon

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const [targetLang, setTargetLang] = useState("en"); // Selected language
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Default English texts
  const defaultTexts = {
    welcomeBack: "Welcome Back",
    signInToContinue: "Sign in to continue",
    emailLabel: "Email",
    passwordLabel: "Password",
    signInButton: "Sign In",
    signingIn: "Signing In...",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    forgotPassword: "Forgot your password?",
    clickHere: "Click here"
  };

  useEffect(() => {
    // Load saved user
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    // Translate UI whenever language changes
    async function translateUI() {
      const results = {};
      for (const key in defaultTexts) {
        results[key] = await translateText(defaultTexts[key], targetLang);
      }
      setTranslatedTexts(results);
    }
    translateUI();
  }, [targetLang]);

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

  async function translateText(text, targetLang) {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: targetLang })
      });
      const data = await res.json();
      return data.translation || text;
    } catch {
      return text;
    }
  }

  const handleLanguageChange = (lang) => {
    setTargetLang(lang);               // Update state
    localStorage.setItem("lang", lang); // Save in localStorage
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Login failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.role)
        setUser(data.user);
        setRole(data.role); // also update state immediately
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Login failed");
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

        {/* Language Switcher */}
        <select
          value={targetLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-3 py-2 rounded bg-white text-black" style={{background: "lab(92.0301% -2.24757 -11.6453)"}}
        >
          <option value="en">English</option>
          <option value="ms">Malay</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="th">Thai</option>
        </select>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-500/0 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            <img
              src="/favicon.ico"   // ✅ your image in public/logo.png
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Ai Atlas</h3>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {translatedTexts.welcomeBack || defaultTexts.welcomeBack}
        </h2>
        <p className="text-gray-500 text-center mb-6">
          {translatedTexts.signInToContinue || defaultTexts.signInToContinue}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              {translatedTexts.emailLabel || defaultTexts.emailLabel}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translatedTexts.emailLabel || defaultTexts.emailLabel}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              {translatedTexts.passwordLabel || defaultTexts.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none text-gray-600"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition"
          >
            {loading ? (translatedTexts.signingIn || defaultTexts.signingIn) : (translatedTexts.signInButton || defaultTexts.signInButton)}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {translatedTexts.dontHaveAccount || defaultTexts.dontHaveAccount}{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            {translatedTexts.signUp || defaultTexts.signUp}
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-1">
          {translatedTexts.forgotPassword || defaultTexts.forgotPassword}{" "}
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            {translatedTexts.clickHere || defaultTexts.clickHere}
          </Link>
        </p>
      </div>
    </div>
  );
}


