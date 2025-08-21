import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { messages, userId, conversationId } = await req.json();

    // If no conversationId, create new one
    const convId = conversationId || uuidv4();

    // Save last user message
    const lastMsg = messages[messages.length - 1];
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, user_id, role, message, created_at) VALUES (?, ?, ?, ?, NOW())",
      [convId, userId, lastMsg.role, lastMsg.content]
    );

    // Send messages to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const aiReply = completion.choices[0].message.content;

    // Save AI response
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, user_id, role, message, created_at) VALUES (?, ?, 'assistant', ?, NOW())",
      [convId, userId, aiReply]
    );

    return NextResponse.json({ reply: aiReply, conversationId: convId });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
