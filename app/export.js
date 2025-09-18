import mysql from "mysql2/promise";
import { read, utils } from "xlsx";

// --- MySQL Connection ---
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DB || "ai_atlas",
  waitForConnections: true,
  connectionLimit: 10,
});

// --- Function to clean Excel keys ---
function cleanDataKeys(data) {
  return data.map((row) => {
    const cleaned = {};
    for (const key in row) {
      cleaned[key.trim().toLowerCase()] = row[key];
    }
    return cleaned;
  });
}

// --- Import Excel into MySQL ---
async function importExcel(filePath, category) {
  try {
    console.log(`📂 Reading ${filePath}...`);
    const workbook = read(filePath, { type: "file" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = utils.sheet_to_json(sheet);
    const data = cleanDataKeys(raw);

    console.log(`Found ${data.length} rows in ${category}...`);

    for (const row of data) {
      const issueId = row["issue id"] || row["issueid"] || null;
      const issue = row["issue"] || "";
      const solution = row["solution"] || "";

      await pool.query(
        `INSERT INTO issues (category, issue_id, issue, solution) VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE issue=?, solution=?`,
        [category, issueId, issue, solution, issue, solution]
      );
    }

    console.log(`✅ Imported ${data.length} rows into ${category}`);
  } catch (err) {
    console.error(`❌ Error importing ${filePath}:`, err);
  }
}

// --- Run Import ---
(async () => {
  await importExcel("api/chat/data/axi_learn.xlsx", "AXI");
  console.log("🎉 Import finished!");
  process.exit(0);
})();
