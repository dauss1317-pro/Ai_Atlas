import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { read, utils } from "xlsx";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

let axiData = [];
let aoiData = [];
let excelLoaded = false;

// We'll cache embeddings here: { AXI: [...], AOI: [...] }
const cachedEmbeddings = {
  AXI: [],
  AOI: [],
};

function cleanDataKeys(data) {
  return data.map((row) => {
    const cleaned = {};
    for (const key in row) {
      cleaned[key.trim().toLowerCase()] = row[key];
    }
    return cleaned;
  });
}

async function fetchEmbedding(text) {
  try {
    const res = await fetch("http://localhost:8000/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`Local Embedding API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.embedding;
  } catch (error) {
    console.error("❌ Error fetching embedding:", error);
    throw error;
  }
}

async function loadExcelFromUrl() {
  try {
    const axiUrl = "https://laanungadget.com/data/axi_learn.xlsx";
    const aoiUrl = "https://laanungadget.com/data/aoi_learn.xlsx";

    // Fetch AXI Excel
    const axiResponse = await fetch(axiUrl);
    if (!axiResponse.ok) throw new Error(`Failed to fetch AXI Excel: ${axiResponse.statusText}`);
    const axiBuffer = Buffer.from(await axiResponse.arrayBuffer());
    const wbAxi = read(axiBuffer, { type: "buffer" });
    const axiSheet = wbAxi.Sheets[wbAxi.SheetNames[0]];
    const rawAxi = utils.sheet_to_json(axiSheet);
    axiData = cleanDataKeys(rawAxi);

    // Fetch AOI Excel
    const aoiResponse = await fetch(aoiUrl);
    if (!aoiResponse.ok) throw new Error(`Failed to fetch AOI Excel: ${aoiResponse.statusText}`);
    const aoiBuffer = Buffer.from(await aoiResponse.arrayBuffer());
    const wbAoi = read(aoiBuffer, { type: "buffer" });
    const aoiSheet = wbAoi.Sheets[wbAoi.SheetNames[0]];
    const rawAoi = utils.sheet_to_json(aoiSheet);
    aoiData = cleanDataKeys(rawAoi);

    // Precompute embeddings for AXI issues
    cachedEmbeddings.AXI = [];
    for (const row of axiData) {
      try {
        const issueText = (row.issue || "").toString().trim();
        const embedding = await fetchEmbedding(issueText);
        cachedEmbeddings.AXI.push(embedding);
      } catch (e) {
        console.warn("⚠️ Failed to embed AXI issue:", row.issue, e.message);
        cachedEmbeddings.AXI.push(null);
      }
    }

    // Precompute embeddings for AOI issues
    cachedEmbeddings.AOI = [];
    for (const row of aoiData) {
      try {
        const issueText = (row.issue || "").toString().trim();
        const embedding = await fetchEmbedding(issueText);
        cachedEmbeddings.AOI.push(embedding);
      } catch (e) {
        console.warn("⚠️ Failed to embed AOI issue:", row.issue, e.message);
        cachedEmbeddings.AOI.push(null);
      }
    }

    excelLoaded = true;
    console.log("✅ Excel data and embeddings loaded successfully.");
  } catch (err) {
    console.error("❌ Error loading Excel or embeddings:", err);
    throw err;
  }
}

// Ensure Excel is loaded before use
export async function ensureExcelLoaded() {
  if (!excelLoaded) await loadExcelFromUrl();
}


function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}


// Generate chat title with Ollama AI
async function generateTitleWithOllama(messages) {
  const prompt = `Summarize this chat conversation into a concise, descriptive title (max 5 words):\n\n${messages.join("\n")}`;

  console.log("Generating chat title with Ollama...");

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      messages: [
        { role: "system", content: "You summarize chat conversations into short titles." },
        { role: "user", content: prompt },
      ],
      max_tokens: 20,
      temperature: 0.5,
    }),
  });

  if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

  const rawText = await response.text();
  let fullReply = "";
  rawText.trim().split("\n").forEach((line) => {
    try {
      const obj = JSON.parse(line);
      if (obj.message?.content) fullReply += obj.message.content;
    } catch {
      // ignore parse errors
    }
  });

  // Remove leading/trailing quotes if present
  let title = fullReply.trim();
  if (title.startsWith('"') && title.endsWith('"')) {
    title = title.slice(1, -1);
  }

  console.log("Generated title:", fullReply.trim() || "Untitled Chat");
  return title.trim() || "Untitled Chat";
}


// Lazy embedding for a row
async function getRowEmbedding(category, index, text) {
  if (cachedEmbeddings[category][index]) return cachedEmbeddings[category][index];
  const emb = await fetchEmbedding(text);
  cachedEmbeddings[category][index] = emb;
  return emb;
}

export async function findTopSemanticMatches(query, category, topN = 3) {
  if (!["AXI", "AOI"].includes(category)) return [];
  await ensureExcelLoaded();

  const data = category === "AXI" ? axiData : aoiData;
  if (!data.length) return [];

  const queryEmbedding = await fetchEmbedding(query);
  if (!queryEmbedding) return [];

  const scored = await Promise.all(
    data.map(async (row, i) => {
      const emb = await getRowEmbedding(category, i, row.issue || "");
      if (!emb) return null;
      return {
        score: cosineSimilarity(queryEmbedding, emb),
        issueId: row["issue id"] || row["issueid"] || "",
        issue: row.issue || "",
        solution: row.solution || "",
      };
    })
  );

  const MIN_SCORE = 0.5;
  const filtered = scored.filter(Boolean).filter(m => m.score >= MIN_SCORE);
  filtered.sort((a, b) => b.score - a.score);

  return filtered.slice(0, topN);
}

const userCategoryMap = {};

async function generateReplyWithOllama(systemPrompt, userPrompt) {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [systemPrompt, userPrompt],
        stream: true, // if Ollama supports streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    // Get raw NDJSON response text
    const rawText = await response.text();

    let fullReply = "";
    // Split by newline, parse JSON, append content
    rawText.trim().split("\n").forEach((line) => {
      try {
        const obj = JSON.parse(line);
        if (obj.message?.content) {
          fullReply += obj.message.content;
        }
      } catch {
        // Ignore lines that are not valid JSON
      }
    });

    const aiReply = fullReply.trim() || "No reply from Ollama";

    return aiReply;
  } catch (error) {
    console.error("❌ Error communicating with Ollama API:", error);
    throw error;
  }
}

async function getGeneralAdviceWithOllama(systemPrompt, userMessage, category, username) {
  console.log("⚙️ Running Ollama fallback for category:", category);

  const ollamaRes = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      stream: false,
      messages: [
        systemPrompt,
        {
          role: "user",
          content: `The user asked: "${userMessage}"\n\nNo exact match found in the ${category} knowledge base.
Please provide a **general troubleshooting guide** relevant to this question.`
        }
      ]
    })
  });

  const ollamaData = await ollamaRes.json();
  console.log("📦 Ollama raw response:", ollamaData);

  return (
    ollamaData.message?.content ||
    `Dear ${username},\n\nUnfortunately, I couldn't find a direct solution. Here are some general troubleshooting tips:\n1. Check cables\n2. Restart machine\n\nBest regards,\n**Atlas Assistant Agent**\nMTSC.AI`
  );
}


    // Store matches for each conversation
    const conversationMatches = {}; // { conversationId: [matches] }

export async function POST(req) {
  try {
    await ensureExcelLoaded();

    const { messages, userId, conversationId } = await req.json();
    const convId = conversationId || uuidv4();
    const lastMsg = messages[messages.length - 1];

    // Save the user message
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, user_id, role, message, created_at) VALUES (?, ?, ?, ?, NOW())",
      [convId, userId, lastMsg.role, lastMsg.content]
    );

    // Handle first message category menu

     // Fetch username
    let username = "User";
    try {
      const [rows] = await pool.query("SELECT name FROM users WHERE id = ?", [userId]);
      if (rows.length) username = rows[0].name;
    } catch {
      // ignore error, keep default username
    }

    if (!conversationId) {
      return NextResponse.json({
        reply: `Hello ${username}! Please select your support type to continue.`,
        menuOptions: [
          { label: "AXI Support", value: "AXI" },
          { label: "AOI Support", value: "AOI" },
        ],
        conversationId: convId,
      });
    }

    // Count how many user messages have been sent in this conversation
    const [[{ user_message_count }]] = await pool.query(
      "SELECT COUNT(*) AS user_message_count FROM chat_messages WHERE conversation_id = ? AND role = 'user'",
      [convId]
    );
    console.log(`User message count for conversation ${convId}:`, user_message_count);

    // Generate title after 3rd user message if no title exists
    if (user_message_count === 3) {
      const [titleRows] = await pool.query(
        "SELECT message FROM chat_messages WHERE conversation_id = ? AND role = 'user' ORDER BY created_at ASC LIMIT 5",
        [convId]
      );
      const titleMessages = titleRows.map((r) => r.message);
      const title = await generateTitleWithOllama(titleMessages);

      await pool.query(
        `INSERT INTO chat_conversations (conversation_id, user_id, title, created_at) VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [convId, userId, title]
      );
      console.log("Updated conversation title:", title);
    }

    // Handle category selection
    if (["AXI", "AOI"].includes(lastMsg.content.toUpperCase())) {
      userCategoryMap[userId] = lastMsg.content.toUpperCase();
      return NextResponse.json({
        reply: `Got it! You’ve selected **${lastMsg.content.toUpperCase()}** support. Please describe your issue.`,
        conversationId: convId,
      });
    }

    // Require user to select category first
    const category = userCategoryMap[userId];
    if (!category) {
      return NextResponse.json({
        reply: "Please select AXI or AOI first.",
        menuOptions: [
          { label: "AXI Support", value: "AXI" },
          { label: "AOI Support", value: "AOI" },
        ],
        conversationId: convId,
      });
    }

    const followUpKeywords = [
      "not solved", "still same", "still the same", "not working",
      "didn't work", "no change", "still issue", "still problem", "still didnt work"
    ];

    const isFollowUpNotSolved = followUpKeywords.some(keyword =>
      lastMsg.content.toLowerCase().includes(keyword)
    );

    console.log(`Follow-up detected: ${isFollowUpNotSolved ? "Yes" : "No"}`);

    const minScore = 0.5; // adjust threshold as needed
    console.log("🟢 Received message:", lastMsg.content);
    console.log("Conversation ID:", convId, "| Category:", category);
    console.log("Follow-up not solved?", isFollowUpNotSolved);

    // Get matches
    let matches;
    if (isFollowUpNotSolved && conversationMatches[convId]) {
      console.log("🔄 Using stored matches from conversation memory");
      matches = conversationMatches[convId].matches;
    } else {
      matches = await findTopSemanticMatches(lastMsg.content, category);
      console.log("🔍 Running semantic search for:", lastMsg.content);
      conversationMatches[convId] = { matches, usedCount: 0 };
    }

    // Filter by score
    let filteredMatches = matches.filter(m => m.score >= minScore);
    console.log(`✅ Filtered matches (score >= ${minScore}):`, filteredMatches.length);

    if (filteredMatches.length) {
      filteredMatches.forEach((m, i) => {
        console.log(
          `   #${i + 1} | Score: ${m.score.toFixed(3)} | Issue: ${m.issue}`
        );
      });
    }

    // If no good matches → Ollama fallback
    if (!filteredMatches.length) {
      console.log(`No matches >= ${minScore} — falling back to Ollama`);
      const systemPrompt = {
        role: "system",
        content: `
      1. You are a helpful technical troubleshooter. 
    2. Structured Response Style:
    - Always begin with:
    Dear ${username},
    3. Reply in the same language as the user.`
      };
      const ollamaReply = await getGeneralAdviceWithOllama(systemPrompt, lastMsg.content, category, username);

    // Save assistant reply
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, user_id, role, message, created_at) VALUES (?, ?, 'assistant', ?, NOW())",
      [convId, userId, ollamaReply]
    );
      
      return NextResponse.json({ reply: ollamaReply, conversationId: convId });
    }

    // Pick match for follow-up or new question
    let selectedMatch = null;
    if (isFollowUpNotSolved && filteredMatches.length > 1) {
      let usedCount = conversationMatches[convId].usedCount || 0;
      let nextIndex = usedCount + 1;
      if (nextIndex >= filteredMatches.length) nextIndex = 0; // reset rotation
      selectedMatch = filteredMatches[nextIndex];
      conversationMatches[convId].usedCount = nextIndex;
      console.log(`🔄 Follow-up mode → Rotating to match index ${nextIndex}`);
    } else {
      selectedMatch = filteredMatches[0];
      conversationMatches[convId].usedCount = 0;
      console.log("🆕 New question → Using best match (index 0)");
    }

    console.log("🎯 Raw selectedMatch:", selectedMatch);

    console.log("🎯 Selected match:", {
      score: selectedMatch.score,
      issue: selectedMatch.issue || selectedMatch.Issue,
      solution: selectedMatch.solution || selectedMatch.Solution
    });

    // Prepare glossary (hardcoded for now)
    const glossary = `
    Glossary of special terms:
    - AWA: Machine Auto Width Adjustment 
    - Clearpath : Software for homing Z-axis manually
    - PiP || PIP || pip : panel in place its stop production board from out from rail
    - Filter Height : sensor that filter the component which exceed the limit before enter the machine
    - Teaming : it is network teaming to configure and combine network into 1 single network
    - Vitrox : company that provide x-ray and optical machine
    - IRP || irp : image recontruction processor use for image generation process
    - rhs || RHS : right hand side
    - lhs || LHS : left hand side
    - VVTS : vitrox verification tool solution
    - PM : preventive maintenence
    - LE || AKD : motion controller driver
    - digital io || digital I/O : hardware to control input output`;

    // Prepare system prompt
    const systemPrompt = {
      role: "system",
      content: `1. You are a helpful technical troubleshooter. 
    2. Structured Response Style:
    - Always begin with:
    Dear ${username},
    - Provide clear, actionable steps for technicians.
    - Bold important points.
    3. Maintain a respectful, helpful, and professional tone.
    4. Reply in the same language as the user's question
    5. If the user follows up saying it still cannot be solved, provide the nearest solution based on the next best match.
    6. Strictly dont show any signature or best regard
    ${glossary}
    `,
    };

    // Prepare user prompt
    let userPrompt;
    if (selectedMatch) {
      userPrompt = {
        role: "user",
        content: `The user asked: "${lastMsg.content}"\n\n` +
          `From the ${category} troubleshooting guide:\n` +
          `Issue: ${selectedMatch.issue || "Unknown"}\n` +
          `Solution:\n${selectedMatch.solution || "No solution provided"}\n\n` +
          `Please rewrite this solution in a clear, step-by-step format, friendly and easy to follow, and respond in the same language as the user's question.`,
      };
    } else {
      userPrompt = {
        role: "user",
        content: `The user asked: "${lastMsg.content}"\n\n` +
          `No close match found in the ${category} troubleshooting guide.\n` +
          `Please provide helpful general troubleshooting advice for this type of issue.`,
      };
    }

    // Generate AI reply
    const aiReply = await generateReplyWithOllama(systemPrompt, userPrompt);

    // Save assistant reply
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, user_id, role, message, created_at) VALUES (?, ?, 'assistant', ?, NOW())",
      [convId, userId, aiReply]
    );

    return NextResponse.json({ reply: aiReply, conversationId: convId });
  } catch (err) {
    console.error("❌ Chat API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}