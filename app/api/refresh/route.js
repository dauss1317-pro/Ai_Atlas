import jwt from "jsonwebtoken";

export async function POST(req) {
  const { refreshToken } = await req.json();

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const newToken = jwt.sign(
      { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return new Response(JSON.stringify({
      ok: true,
      token: newToken,
      user: { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid refresh token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
