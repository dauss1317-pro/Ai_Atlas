// app/api/chat-assistant/route.js

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { messages, userId, conversationId } = body;

//     // Forward to Python backend
//     const pyRes = await fetch("http://localhost:5000/query", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         question: messages[messages.length - 1].content,
//         userId,
//         conversationId,
//       }),
//     });

//     const data = await pyRes.json();

//     return new Response(
//       JSON.stringify({
//         reply: data.reply,
//         menuOptions: data.menuOptions || [],
//         conversationId: conversationId || "conv-" + Date.now(),
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (err) {
//     console.error("Chat API error:", err);
//     return new Response(
//       JSON.stringify({ error: "Internal server error" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

// app/api/chat-assistant/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, userId, conversationId, category, username } = body;

    const lastMessage = messages?.[messages.length - 1]?.content || "";

    // Forward to Python backend
    const pyRes = await fetch("http://localhost:5000/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: lastMessage,
        category, // ✅ pass category
        userId,
        conversationId,
        username,
      }),
    });

    const data = await pyRes.json();

    return new Response(
      JSON.stringify({
        reply: data.reply,
        menuOptions: data.menuOptions || [],
        conversationId: conversationId || "conv-" + Date.now(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

