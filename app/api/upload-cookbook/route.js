import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ success: false, error: "Content-Type must be multipart/form-data" }),
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const category = formData.get("Category")?.toString() || "Uncategorized"; // get category from frontend
    const file = formData.get("Documentation");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: "No file uploaded" }),
        { status: 400 }
      );
    }

    // Save in pdf_upload/AXI/<category> folder
    const uploadDir = path.join(process.cwd(), "public", "pdf_upload", "AXI", category);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Upload successful",
        file: `/pdf_upload/AXI/${category}/${fileName}`,
        category
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
