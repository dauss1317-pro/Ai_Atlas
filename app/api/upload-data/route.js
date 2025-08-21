// import fs from "fs";
// import path from "path";
// import { read, utils, write } from "xlsx";

// // This is the real file path in cPanel, not the URL
// const axiFilePath = "https://laanungadget.com/data/axi_learn.xlsx";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { issue, solution } = body;

//     // 1. Read current Excel file from server
//     // Fetch AXI Excel
//     const axiResponse = await fetch(axiFilePath);
//     if (!axiResponse.ok) throw new Error(`Failed to fetch AXI Excel: ${axiResponse.statusText}`);
//     const axiBuffer = Buffer.from(await axiResponse.arrayBuffer());

//     // Read workbook
//     const workbook = read(axiBuffer, { type: "buffer" });
//     console.log("workbook", workbook);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];

//     // Convert sheet to JSON
//     let data = utils.sheet_to_json(sheet);

//     // 2. Find last ID
//     const lastId = data.length > 0 ? Math.max(...data.map(row => row.ID || row.id || 0)) : 0;

//     // Add new row
//     const newRow = {
//     ID: lastId + 1,
//     Issue: issue,
//     Solution: solution
//     };
//     data.push(newRow);

//     // Convert JSON back to sheet
//     const newSheet = utils.json_to_sheet(data);
//     workbook.Sheets[sheetName] = newSheet;

//     // Save to actual server path (not URL!)
//     fs.writeFileSync(
//     "/home/laanungadget.com/public_html/data/axi_learn.xlsx",
//     write(workbook, { bookType: "xlsx", type: "buffer" })
//     );

//     return new Response(
//       JSON.stringify({ success: true, message: `New ID: ${lastId + 1}` }),
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("Error updating Excel:", err);
//     return new Response(
//       JSON.stringify({ success: false, error: err.message }),
//       { status: 500 }
//     );
//   }
// }

// import fs from "fs";
// import fetch from "node-fetch";
// import { read, utils, write } from "xlsx";
// import ftp from "basic-ftp";

// const ftpConfig = {
//     host: process.env.FTP_HOST,
//     user: process.env.FTP_USER,
//     password: process.env.FTP_PASS,
// };

// export async function updateExcel(issue, solution) {
//     const fileName = "axi_learn.xlsx";
//     const tempPath = `/tmp/${fileName}`;
//     const fileUrl = `https://laanungadget.com/data/${fileName}`;

//     // 1. Download from domain
//     const res = await fetch(fileUrl);
//     const buffer = Buffer.from(await res.arrayBuffer());
//     fs.writeFileSync(tempPath, buffer);

//     // 2. Read and modify
//     const workbook = read(fs.readFileSync(tempPath));
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     let data = utils.sheet_to_json(sheet);

//     const lastId = data.length > 0 ? Math.max(...data.map(row => row.ID || 0)) : 0;
//     data.push({ ID: lastId + 1, Issue: issue, Solution: solution });

//     workbook.Sheets[sheetName] = utils.json_to_sheet(data);
//     fs.writeFileSync(tempPath, write(workbook, { bookType: "xlsx", type: "buffer" }));

//     // 3. Upload back via FTP
//     const client = new ftp.Client();
//     try {
//         await client.access(ftpConfig);
//         await client.uploadFrom(tempPath, `/public_html/data/${fileName}`);
//         console.log("✅ Excel updated and uploaded!");
//     } catch (err) {
//         console.error("❌ FTP upload failed:", err);
//     } finally {
//         client.close();
//     }
// }

// app/api/upload-data/route.js
import fs from "fs";
import { read, utils, write } from "xlsx";
import ftp from "basic-ftp";

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
};

export async function POST(req) {
    try {
        const { issue, solution } = await req.json();
        const fileName = "axi_learn.xlsx";
        const tempPath = `/tmp/${fileName}`;
        const fileUrl = `https://laanungadget.com/data/${fileName}`;

        // 1. Download latest Excel
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
        fs.writeFileSync(tempPath, Buffer.from(await res.arrayBuffer()));

        // 2. Read + modify
        const workbook = read(fs.readFileSync(tempPath));
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let data = utils.sheet_to_json(sheet);

        const lastId = data.length > 0 
            ? Math.max(...data.map(row => row["Issue ID"] || 0))
            : 0;
        data.push({ "Issue ID" : lastId + 1, Issue: issue, Solution: solution });

        workbook.Sheets[sheetName] = utils.json_to_sheet(data);
        fs.writeFileSync(tempPath, write(workbook, { bookType: "xlsx", type: "buffer" }));

        // 3. Upload back to FTP
        const client = new ftp.Client();
        try {
            await client.access(ftpConfig);
            await client.uploadFrom(tempPath, `data/${fileName}`);
        } finally {
            client.close();
        }

        return new Response(JSON.stringify({ success: true, message: `New ID: ${lastId + 1}` }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error updating Excel:", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}


