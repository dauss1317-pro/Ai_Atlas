import fs from "fs";
import path from "path";
import mysql from "mysql2/promise"; // or your preferred DB client

export async function POST(req) {
  let connection;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ success: false, error: "Content-Type must be multipart/form-data" }),
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("Title")?.toString() || "";
    const description = formData.get("Description")?.toString() || "";
    const file = formData.get("Documentation");

    let fileName = null;
    let dbFilePath =null;
    if (file && file instanceof File) {
      const uploadDir = path.join(process.cwd(), "public", "pdf_upload");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      fileName = `${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      dbFilePath = `/pdf_upload/${fileName}`;
    }

    // Create a reusable connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [result] = await pool.execute(
      `INSERT INTO axi_categories (title, description, pdf_link) VALUES (?, ?, ?)`,
      [title, description, dbFilePath]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Upload & DB update successful",
        id: result.insertId,
        file: fileName,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
