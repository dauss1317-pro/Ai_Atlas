import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

export const runtime = "node";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ ok: false, error: "Token and new password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if token exists and is valid (not expired)
    const [rows] = await pool.query(
      "SELECT user_id, expires_at FROM password_resets WHERE token = ?",
      [token]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid or expired token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resetRequest = rows[0];
    const expiresAt = new Date(resetRequest.expires_at);

    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Token has expired" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      resetRequest.user_id,
    ]);

    // Delete used token
    await pool.query("DELETE FROM password_resets WHERE token = ?", [token]);

    return new Response(
      JSON.stringify({ ok: true, message: "Password has been reset successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
