// /api/chat-messages/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

const JWT_SECRET = "your-secret-key";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    const url = new URL(req.url);
    const conversation_id = url.searchParams.get("conversation_id");
    if (!conversation_id) {
      return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
    }

    const [messages] = await pool.query(
      `SELECT id, role, message FROM chat_messages WHERE user_id = ? AND conversation_id = ? ORDER BY created_at ASC`,
      [userId, conversation_id]
    );

    return NextResponse.json(messages);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
