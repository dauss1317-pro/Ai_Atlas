import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// export const runtime = 'node';

// Create a reusable connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // User not found
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = rows[0];

    // Assuming your database stores hashed passwords, use bcrypt to compare
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    // console.log('Comparing password', password, 'against hash', user.password_hash);

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const refreshToken = jwt.sign(
      { email: user.email, id: user.id, name: user.name, role:user.role},
      process.env.REFRESH_SECRET,
      { expiresIn: '1h' } // long-lived refresh token
    );
    // Password is correct - generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role:user.role}, // now includes name
      process.env.JWT_SECRET, // don't hardcode!
      { expiresIn: '15m' }
    );

    // Return token + user info
    return new Response(JSON.stringify({
      ok: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name, // make sure you have this column in MySQL
        email: user.email,
        role:user.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

