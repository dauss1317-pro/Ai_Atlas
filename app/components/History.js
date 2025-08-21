"use client";

import { useEffect, useState } from "react";
import { FaClipboard } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null); // chat summary info
  const [selectedChatMessages, setSelectedChatMessages] = useState([]); // full chat messages
  const [loadingChat, setLoadingChat] = useState(false);
  const [toast, setToast] = useState(null); // string message or null

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await fetch("/api/chat-history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        console.log("Chat history response:", data);
        setHistory(data.conversations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
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

  // Fetch full chat messages when user clicks a history item
  async function openChat(conversation) {
    setSelectedChat(conversation);
    setLoadingChat(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const res = await fetch(`/api/chat-messages?conversation_id=${conversation.conversation_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch chat messages");
      const data = await res.json();
      setSelectedChatMessages(data);
    } catch (err) {
      console.error(err);
      setSelectedChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading chat history...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ color: "black" }}>
        Chat History
      </h2>
      <ul className="space-y-3">
        {history.length > 0 ? (
          history.map((chat, index) => (
            <li
              key={chat.conversation_id}
              className="p-4 bg-white rounded-lg shadow hover:bg-blue-50 cursor-pointer"
              onClick={() => openChat(chat)}
            >
              <h3 className="font-semibold text-gray-800">{chat.title || `Chat ${index + 1}`}</h3>
              <p className="text-gray-600 text-sm">{chat.snippet}</p>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No chat history found.</p>
        )}
      </ul>

      {/* Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{backgroundColor:"rgb(0 0 0 / 65%)"}}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] p-6 relative flex flex-col">
            <button
              onClick={() => {
                setSelectedChat(null);
                setSelectedChatMessages([]);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4" style={{ color: "black" }}>Chat {history.indexOf(selectedChat) + 1} Details</h2>

            {/* Chat box area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-300">
              {loadingChat ? (
                <p className="text-gray-500">Loading chat...</p>
              ) : selectedChatMessages.length > 0 ? (
                selectedChatMessages.map(({ id, role, message }) => (
                  <div
                    key={id}
                    className={`flex mb-2 ${role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg whitespace-pre-wrap relative ${
                        role === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <ReactMarkdown>{message}</ReactMarkdown>
                      {role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message)}
                          className="sticky right-0 top-0 m-1 p-1 hover:bg-gray-300 rounded"
                          aria-label="Copy message"
                          title="Copy to clipboard"
                          style={{ fontSize: "0.8rem", lineHeight: 1, cursor: "pointer", position: "absolute" }}
                        >
                          <FaClipboard />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No messages found in this chat.</p>
              )}
            </main>

            {toast && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow-md z-50 pointer-events-none">
                {toast}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
