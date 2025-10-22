import fs from "fs";
import path from "path";

export async function GET() {
  const basePath = path.join(process.cwd(), "public/pdf_upload/AXI");

  const categories = [];

  try {
    const categoryFolders = fs.readdirSync(basePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const folder of categoryFolders) {
      const folderPath = path.join(basePath, folder.name);
      const pdfFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith(".pdf"));

      const pdfEntries = pdfFiles.map((file, index) => {
        const name = file.replace(".pdf", "").replace(/_/g, " ");
        const title = name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return {
          id: `${folder.name}-${index}`,
          title,
          description: `Category: ${folder.name}`,
          pdf_link: `/pdf_upload/AXI/${folder.name}/${file}`,
          category: folder.name,
        };
      });

      categories.push({
        category: folder.name,
        items: pdfEntries,
      });
    }

    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    console.error("Error reading PDF folder:", error);
    return new Response(JSON.stringify({ error: "Failed to load PDFs" }), { status: 500 });
  }
}

