import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FaClipboard, FaPlus, FaTimes } from "react-icons/fa";
import { MdWallpaper } from "react-icons/md";

export default function ChatBox() {
  const [messages, setMessages] = useState([]); // start empty
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // ✅ store user here
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);
  const [toast, setToast] = useState(null);
  const [open, setOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
      <span
        className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></span>
      <span
        className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
        style={{ animationDelay: "0.4s" }}
      ></span>
    </div>
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    const storedWallpaper = localStorage.getItem("wallpaper");
    if (storedWallpaper) {
      setWallpaper(storedWallpaper);
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch("/api/wallpaper", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.wallpaper && data.wallpaper !== storedWallpaper) {
          setWallpaper(data.wallpaper);
          localStorage.setItem("wallpaper", data.wallpaper);
        }
      })
      .catch((err) => console.error("Failed to load wallpaper:", err));
  }, []);

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setToast("Copied to clipboard!");
        setTimeout(() => setToast(null), 2000);
      });
    }
  }

  function typeWriterEffect(messageId, fullText, setMessages, speed = 40) {
    let index = 0;

    function typeNext() {
      if (index <= fullText.length) {
        const currentText = fullText.slice(0, index);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, text: currentText, typing: index < fullText.length }
              : m
          )
        );

        index++;
        setTimeout(typeNext, speed);
      }
    }

    typeNext();
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileClick = (accept) => {
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
    setShowMenu(false);
  };

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

    const botTypingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: botTypingId, role: "bot", text: "__TYPING__" },
    ]);

    try {
      const res = await fetch("/api/chat-assistant", {
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
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const aiReply =
        data.reply || "Hmm... I couldn’t think of anything to say.";
      const botMessageId = Date.now() + 1;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== botTypingId),
        { id: botMessageId, role: "bot", text: "", typing: true },
      ]);

      setTimeout(() => {
        typeWriterEffect(botMessageId, aiReply, setMessages, 40);
      }, 50);
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botTypingId
            ? {
                id: Date.now(),
                role: "bot",
                text: "⚠️ Sorry, something went wrong.",
              }
            : m
        )
      );
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <header
        className="flex justify-between items-center text-white p-4 rounded-t-lg font-semibold text-lg"
        style={{ backgroundColor: "#2a3f93" }}
      >
        Smart SOP Assistant
        <button
          onClick={() => setOpen(true)}
          className="text-white hover:text-gray-300 transition"
        >
          {/* <MdWallpaper size={24} /> */}
        </button>
      </header>

      <main
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[400px]"
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {messages.length > 0 ? (
          <>
            {messages.map(({ id, role, text, options, typing }) => (
              <div
                key={id}
                className={`flex ${
                  role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg whitespace-pre-wrap ${
                    role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {text === "__TYPING__" && <TypingIndicator />}

                  {role === "bot" && text !== "__TYPING__" && (
                    <>
                      {typing ? (
                        <span>{text}</span>
                      ) : (
                        <ReactMarkdown>{text}</ReactMarkdown>
                      )}
                      <button
                        onClick={() => copyToClipboard(text)}
                        className="sticky right-0 top-0 m-1 p-1 hover:bg-gray-300 rounded"
                        aria-label="Copy message"
                        title="Copy to clipboard"
                        style={{ fontSize: "0.8rem", lineHeight: 1, cursor: "pointer" }}
                        >
                        <FaClipboard />
                       </button>
                    </>
                  )}

                  {role === "user" && <ReactMarkdown>{text}</ReactMarkdown>}

                  {options && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {options.map((opt, idx) => {
                        const label =
                          typeof opt === "string" ? opt : opt.label;
                        const value =
                          typeof opt === "string" ? opt : opt.value;
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
            ))}
          </>
        ) : (
          <div className="text-gray-500 text-center" style={{ color: "white" }}>
            Atlas now has our smartest, fastest, most useful AI to assist in providing the procedure and step to completing the task.
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow-md z-50">
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
    </div>
  );
}
