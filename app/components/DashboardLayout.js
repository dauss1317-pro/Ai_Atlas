"use client";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import History from "./History";
import Settings from "./Settings";
import Category from "./Category";
import T_Category from "./T_Category";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new-chat");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Language state
  const [targetLang, setTargetLang] = useState("en");
  const [translatedTexts, setTranslatedTexts] = useState({});

  // Default texts for sidebar & UI
  const defaultTexts = {
    newChat: "New Chat",
    history: "History",
    settings: "Settings",
    category: "Assistant",
    tCategory: "Category",
    logout: "Logout",
    languageLabel: "Language",
  };

  // Load saved user & language on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setRole(parsedUser.role);
    }

    // const savedLang = localStorage.getItem("lang");
    // if (savedLang && savedLang.toLowerCase() !== "en" && savedLang.toLowerCase() !== "english") {
    //   setTargetLang(savedLang);
    // }
  }, []);

  // Translate texts whenever targetLang changes
  // useEffect(() => {
  //   async function translateUI() {
  //     const results = {};
  //     for (const key in defaultTexts) {
  //       results[key] = await translateText(defaultTexts[key], targetLang);
  //     }
  //     setTranslatedTexts(results);
  //   }
  //   translateUI();
  // }, [targetLang]);

  // Handle language change
  // const handleLanguageChange = (lang) => {
  //   setTargetLang(lang);
  //   localStorage.setItem("lang", lang);
  // };

  // Translation function using /api/translate
  async function translateText(text, targetLang) {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: targetLang }),
      });
      const data = await res.json();
      return data.translation || text;
    } catch {
      return text;
    }
  }

  // Token expiry check with SweetAlert
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      handleLogout();
      return;
    }

    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch (err) {
      console.error("Invalid token", err);
      handleLogout();
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;

    const triggerExpiryAlert = () => {
      let timerInterval;
      Swal.fire({
        title: 'Session Expired!',
        html: 'You will be logged out in <b></b> seconds.',
        icon: 'warning',
        timer: 10000,
        timerProgressBar: true,
        showCancelButton: true,
        confirmButtonText: 'Stay Logged In',
        cancelButtonText: 'Logout Now',
        didOpen: () => {
          const b = Swal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            const remaining = Math.ceil(Swal.getTimerLeft() / 1000);
            b.textContent = remaining;
          }, 1000);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            fetch("/api/refresh-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: refreshToken }),
            })
              .then(res => res.json())
              .then(data => {
                if (data.token) localStorage.setItem("authToken", data.token);
                else handleLogout();
              })
              .catch(() => handleLogout());
          } else handleLogout();
        } else handleLogout();
      });
    };

    if (timeLeft <= 0) triggerExpiryAlert();
    else {
      const timer = setTimeout(triggerExpiryAlert, timeLeft * 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  }

  // Determine main content
  let mainContent;
  if (activeTab === "new-chat") mainContent = children;
  else if (activeTab === "history") mainContent = <History targetLang={targetLang} />;
  else if (activeTab === "settings") mainContent = <Settings targetLang={targetLang} />;
  else if (activeTab === "category") mainContent = <Category targetLang={targetLang} />;
  else if (activeTab === "t_category") mainContent = <T_Category targetLang={targetLang} />;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black-50 bg-opacity-50 z-30 md:hidden" style={{backgroundColor:"#00000099"}}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white shadow-md p-6 flex flex-col justify-between z-40 transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "#1f2e6b", backgroundImage: 'url(/backgorund-image3.png)', backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div>
          {/* <h1 className="text-2xl font-bold mb-8" style={{ color: "white", border: "solid 1px", textAlign: "center", padding: "5px", borderRadius: "10px", boxShadow: "#a013a8 0px 4px 6px" }}>
            Ai Atlas
          </h1> */}
          <h1
            className="text-2xl font-bold mb-8 flex items-center justify-center gap-2"
            style={{
              color: "white",
              border: "solid 1px",
              textAlign: "center",
              padding: "5px",
              borderRadius: "10px",
              boxShadow: "#a013a8 0px 4px 6px"
            }}
          >
            <img
              src="/favicon.ico"   // ✅ your icon in public/logo.png
              alt="Logo"
              className="w-6 h-6"
            />
            Ai Atlas
          </h1>

          {/* Language Dropdown */}
          <div className="mb-4">
            <label className="text-white mb-1 block">
              {/* {translatedTexts.languageLabel || "Language"} */}Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white text-black" style={{background: "lab(92.0301% -2.24757 -11.6453)"}}
              disabled
            >
              <option value="en">English</option>
              <option value="ms">Malay</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="th">Thai</option>
            </select>
          </div>

          <nav className="flex flex-col space-y-4 text-gray-700">
            <button
              onClick={() => { setActiveTab("new-chat"); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-md transition-shadow duration-300
                ${activeTab === "new-chat"
                  ? "bg-blue-100 text-blue-700 shadow-md font-bold"
                  : "text-white hover:text-blue-600 hover:shadow-sm"}`}
            >
              {/* {translatedTexts.newChat || "New Chat"} */}New Chat
            </button>
            <button
              onClick={() => { setActiveTab("history"); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-md transition-shadow duration-300
                ${activeTab === "history"
                  ? "bg-blue-100 text-blue-700 shadow-md font-bold"
                  : "text-white hover:text-blue-600 hover:shadow-sm"}`}
            >
              {/* {translatedTexts.history || "History"} */}History
            </button>
            {role === "admin" && (
              <button
                onClick={() => { setActiveTab("category"); setSidebarOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md transition-shadow duration-300
                  ${activeTab === "category"
                    ? "bg-blue-100 text-blue-700 shadow-md font-bold"
                    : "text-white hover:text-blue-600 hover:shadow-sm"}`}
              >
                {/* {translatedTexts.category || "Assistant"} */}Assistant
              </button>
            )}
            {/* {role === "admin" && ( */}
              <button
                onClick={() => { setActiveTab("t_category"); setSidebarOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md transition-shadow duration-300
                  ${activeTab === "t_category"
                    ? "bg-blue-100 text-blue-700 shadow-md font-bold"
                    : "text-white hover:text-blue-600 hover:shadow-sm"}`}
              >
                {/* {translatedTexts.tCategory || "Category"} */}Category
              </button>
            {/* )} */}
            {role === "admin" && (
            <button
              onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-2 rounded-md transition-shadow duration-300
                ${activeTab === "settings"
                  ? "bg-blue-100 text-blue-700 shadow-md font-bold"
                  : "text-white hover:text-blue-600 hover:shadow-sm"}`}
            >
              {/* {translatedTexts.settings || "Settings"} */}Settings
            </button>
            )}
          </nav>
        </div>

        {/* Profile card */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center space-x-4 bg-white rounded-lg shadow-md p-4">
          <img
            src="https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png"
            alt="User Avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{user?.name || 'Guest'}</p>
            <button
              onClick={handleLogout}
              className="flex items-center text-red-500 hover:text-red-600 space-x-1 text-sm"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {/* <span>{translatedTexts.logout || "Logout"}</span> */}
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-black font-bold">
            <FaBars />
          </button>
          <h2 className="text-lg font-semibold text-black">Atlas</h2>
          <div></div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {mainContent}
        </main>
      </div>
    </div>
  );
}

