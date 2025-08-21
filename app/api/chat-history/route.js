import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

const JWT_SECRET = "your-secret-key"; // Same as in your login code

// Create a reusable connection pool
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

    const [rows] = await pool.query(
      `SELECT c.conversation_id,
       c.title,
       m.created_at AS third_msg_time,
       SUBSTRING(m.message, 1, 100) AS snippet
      FROM (
          SELECT c.conversation_id,
                c.title,
                m.created_at,
                m.message,
                ROW_NUMBER() OVER (
                    PARTITION BY c.conversation_id
                    ORDER BY m.created_at ASC
                ) AS rn
          FROM chat_conversations c
          JOIN chat_messages m 
              ON c.conversation_id = m.conversation_id
          WHERE c.user_id = ?
      ) m
      JOIN chat_conversations c 
          ON c.conversation_id = m.conversation_id
      WHERE m.rn = 3
      ORDER BY third_msg_time DESC
      LIMIT 20;
      `,
      [userId]
    );

    return NextResponse.json({ conversations: rows });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// export async function GET(req) {
//   try {
//     // Get the Authorization header
//     const authHeader = req.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];

//     // Verify JWT
//     let decoded;
//     try {
//       decoded = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     const userId = decoded.id;

//     // Query chat history for this user
//     const [rows] = await pool.query(
//       `SELECT conversation_id, MIN(created_at) as first_msg_time, SUBSTRING(message, 1, 100) as snippet
//       FROM chat_messages
//       WHERE user_id = ?
//       GROUP BY conversation_id
//       ORDER BY first_msg_time DESC
//       LIMIT 20`,
//       [userId]
//     );

//     return NextResponse.json(rows);
//   } catch (err) {
//     console.error("Error fetching chat history:", err);
//     return NextResponse.json({ error: "Database error" }, { status: 500 });
//   }
//}
