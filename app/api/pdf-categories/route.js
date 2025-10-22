import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "pdf_upload", "AXI");
    if (!fs.existsSync(uploadDir)) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const categories = fs.readdirSync(uploadDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
