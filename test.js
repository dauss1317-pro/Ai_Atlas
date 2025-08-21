import fs from "fs";
import path from "path";
import xlsx from "xlsx";

async function testReadExcel() {
  const axiPath = path.resolve("data/axi_learn.xlsx");

  console.log("Checking file exists:", fs.existsSync(axiPath));

  try {
    await fs.promises.access(axiPath, fs.constants.R_OK);
    console.log("Read permission OK");

    const wb = xlsx.readFile(axiPath);
    console.log("Workbook sheets:", wb.SheetNames);

    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Loaded ${data.length} rows`);
    if (data.length > 0) {
      console.log("Sample row keys:", Object.keys(data[0]));
      console.log("Sample row data:", data[0]);
    }
  } catch (err) {
    console.error("Error reading Excel:", err);
  }
}

testReadExcel();
