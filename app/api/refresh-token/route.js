import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(JSON.stringify({ message: "No token provided" }), {
        status: 401,
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ message: "Invalid refresh token" }), {
        status: 403,
      });
    }

    // Optionally check if token exists in DB for revocation

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: "1m" } // your short-lived token
    );

    return new Response(JSON.stringify({ token: newAccessToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
