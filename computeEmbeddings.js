import mysql from "mysql2/promise";
import fetch from "node-fetch";

// MySQL connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ai_atlas",
});

// Fetch embedding from Python server
async function fetchEmbedding(text) {
  const res = await fetch("http://localhost:8000/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!data.embedding) throw new Error("No embedding returned");
  return data.embedding;
}

async function updateEmbeddings() {
  const [rows] = await pool.query("SELECT id, issue FROM issues");

  for (const row of rows) {
    try {
      console.log("Embedding for ID:", row.id);
      const embedding = await fetchEmbedding(row.issue);

      await pool.query(
        "UPDATE issues SET embedding = ? WHERE id = ?",
        [JSON.stringify(embedding), row.id]
      );

      console.log("✅ Updated embedding for ID:", row.id);
    } catch (err) {
      console.error("❌ Failed for ID:", row.id, err.message);
    }
  }
  console.log("All embeddings updated!");
}

updateEmbeddings().then(() => process.exit());
