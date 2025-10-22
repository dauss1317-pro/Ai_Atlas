import mysql from "mysql2/promise";

export async function GET() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const [rows] = await pool.query("SELECT * FROM settings ORDER BY category, id");

  // Group by category
  const grouped = [];
  const map = {};
  for (const row of rows) {
    if (!map[row.category]) {
      map[row.category] = { id: Object.keys(map).length + 1, title: row.category, description: "", fields: [] };
      grouped.push(map[row.category]);
    }
    map[row.category].fields.push({
      label: row.label,
      type: row.type,
      value: row.value,
      options: row.options ? row.options.split(",") : [],
    });
  }

  return new Response(JSON.stringify(grouped), { status: 200 });
}
