import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken"; // 👈 missing import

// ✅ Create a reusable connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// ✅ Verify JWT
function verifyToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT error:", err.message);
    return null;
  }
}

// ✅ GET wallpaper
export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  const [rows] = await pool.query(
    "SELECT background FROM users WHERE id = ? LIMIT 1",
    [decoded.id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, wallpaper: null });
  }

  return NextResponse.json({ ok: true, wallpaper: rows[0].background || null });
}

// ✅ POST wallpaper
export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { wallpaper } = body;
  if (!wallpaper) {
    return NextResponse.json({ ok: false, error: "Missing wallpaper" }, { status: 400 });
  }

  await pool.query("UPDATE users SET background = ? WHERE id = ?", [
    wallpaper,
    decoded.id,
  ]);

  return NextResponse.json({ ok: true });
}
