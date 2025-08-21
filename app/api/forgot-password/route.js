import mysql from "mysql2/promise";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const runtime = "node";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Configure your SMTP transporter (example uses Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // or 587
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // your email address
    pass: process.env.SMTP_PASS, // your email password or app password
  },
});

async function sendResetEmail(email, resetLink) {
  const mailOptions = {
    from: '"Ai Atlas Support" <no-reply@aiatlas.com>',
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;  // rethrow to be caught in POST handler
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      // For security, respond success even if user not found
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = users[0];

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store token in DB
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [user.id, token, expires]
    );

    const resetLink = `https://barrier-tip-abroad-mazda.trycloudflare.com/reset-password?token=${token}`;

    // Send the email
    await sendResetEmail(email, resetLink);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
