"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaClipboard } from "react-icons/fa";
import { MdWallpaper } from "react-icons/md";

export default function Chatbot() {
  const [messages, setMessages] = useState([]); // start empty
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // ✅ store user here
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);
  const [toast, setToast] = useState(null); // string message or null
  const [open, setOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load logged-in user + wallpaper
  // useEffect(() => {
  // const storedUser = localStorage.getItem("user");
  // if (storedUser) {
  //   setCurrentUser(JSON.parse(storedUser));
  // }

  // const token = localStorage.getItem("authToken");
  // if (!token) return;

  //   fetch("/api/wallpaper", {
  //     method: "GET",
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.wallpaper) {
  //         setWallpaper(data.wallpaper);
  //         localStorage.setItem("wallpaper", data.wallpaper); // refresh cache
  //       }
  //     })
  //     .catch((err) => console.error("Failed to load wallpaper:", err));
  // }, []);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    const storedWallpaper = localStorage.getItem("wallpaper");
    if (storedWallpaper) {
      setWallpaper(storedWallpaper); // fast UI update
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Always fetch fresh from DB
    fetch("/api/wallpaper", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.wallpaper && data.wallpaper !== storedWallpaper) {
          setWallpaper(data.wallpaper); // update UI if DB has new one
          localStorage.setItem("wallpaper", data.wallpaper);
        }
      })
      .catch((err) => console.error("Failed to load wallpaper:", err));
  }, []);

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setToast("Copied to clipboard!");
        setTimeout(() => setToast(null), 2000); // hide toast after 2 sec
      }).catch(() => {
        setToast("Failed to copy");
        setTimeout(() => setToast(null), 2000);
      });
    } else {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setToast("Copied to clipboard!");
      } catch {
        setToast("Failed to copy");
      }
      document.body.removeChild(textarea);
      setTimeout(() => setToast(null), 2000);
    }
  }

  function typeWriterEffect(messageId, fullText, callback) {
    let index = 0;

    function type() {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, text: fullText.slice(0, index) }
            : msg
        )
      );
      index++;
      if (index <= fullText.length) {
        setTimeout(type, 30);
      } else {
        callback && callback();
      }
    }

    type();
  }

  async function sendMessage() {
    if (!input.trim()) return;
    if (!currentUser?.id) {
      console.error("No user logged in");
      return;
    }

    const userMessage = { id: Date.now(), role: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role === "bot" ? "assistant" : m.role,
            content: m.text,
          })),
          userId: currentUser.id,
          conversationId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        throw new Error(`HTTP ${res.status} - ${errorText}`);
      }
      const data = await res.json();

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.menuOptions) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "bot",
            text: data.reply || "",
            options: data.menuOptions,
          },
        ]);
        setLoading(false);
      } else {
        const aiReply =
          data.reply || "Hmm... I couldn’t think of anything to say.";

        const botMessageId = Date.now() + 1;
        setMessages((prev) => [
          ...prev,
          { id: botMessageId, role: "bot", text: "" },
        ]);

        setTimeout(() => {
          typeWriterEffect(botMessageId, aiReply, () => setLoading(false));
        }, 90);
      }
    } catch (err) {
      console.error("Chat send error:", err);
      setLoading(false);
    }
  } // ✅ closes sendMessage

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <header
        className="flex justify-between items-center text-white p-4 rounded-t-lg font-semibold text-lg"
        style={{ backgroundColor: "#2a3f93" }}
      >
        Atlas Chatbot
        <button
          onClick={() => setOpen(true)}
          className="text-white hover:text-gray-300 transition"
          title="Change wallpaper"
        >
          <MdWallpaper size={24} />
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[400px]" 
      style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        {messages.length > 0 ? (
          messages.map(({ id, role, text, options }) => (
            <div
              key={id}
              className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg whitespace-pre-wrap ${
                  role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <ReactMarkdown>{text}</ReactMarkdown>
                {role === "assistant" && (
                  <button
                    onClick={() => copyToClipboard(text)}
                    className="sticky right-0 top-0 m-1 p-1 hover:bg-gray-300 rounded"
                    aria-label="Copy message"
                    title="Copy to clipboard"
                    style={{ fontSize: "0.8rem", lineHeight: 1, cursor: "pointer" }}
                  >
                    <FaClipboard />
                  </button>
                )}

                {options && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {options.map((opt, idx) => {
                      const label = typeof opt === "string" ? opt : opt.label;
                      const value = typeof opt === "string" ? opt : opt.value;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(value);
                            sendMessage();
                          }}
                          className="bg-white border border-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center" style={{ color: "white"}}>
            Atlas now has our smartest, fastest, most useful AI to asist in solve the issue without any hesitation.
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow-md z-50 pointer-events-none">
          {toast}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-4 border-t border-gray-200 flex items-center gap-2"
      >
        <textarea
          rows={1}
          className="flex-1 resize-none border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {/* Wallpaper Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{backgroundColor:"rgb(0 0 0 / 65%)"}}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h1 className="text-lg font-bold mb-4" style={{ color: "black", }}>Choose a Wallpaper</h1>
            <div className="grid grid-cols-3 gap-3">
              {["/chat_wallpaper/chat_wallpaper_1.png", "/chat_wallpaper/chat_wallpaper_2.png", "/chat_wallpaper/chat_wallpaper_3.png", "/chat_wallpaper/chat_wallpaper_4.png", "/chat_wallpaper/chat_wallpaper_5.png"].map(
                (bg, idx) => (
                  <div
                    key={idx}
                    className="w-24 h-24 rounded-lg cursor-pointer border hover:scale-105 transition"
                    style={{
                      background: `url(${bg})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    onClick={async () => {
                    try {
                      setWallpaper(bg); // update UI instantly

                      const token = localStorage.getItem("authToken"); // 👈 stored at login
                      await fetch("/api/wallpaper", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`, // 👈 send token instead of userId
                        },
                        body: JSON.stringify({ wallpaper: bg }),
                      });
                    } catch (err) {
                      console.error("Failed to save wallpaper", err);
                    }
                    setOpen(false);
                  }}
                  />
                )
              )}
            </div>

            <button
              className="mt-4 w-full py-2 rounded hover:bg-blue-600" style={{ backgroundColor: "#2a3f93"  }}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
