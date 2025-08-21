import dotenv from "dotenv";

dotenv.config();

async function testEmbedding() {
  const HF_API_TOKEN = process.env.HF_API_TOKEN;
  if (!HF_API_TOKEN) {
    console.error("❌ Please set HF_API_TOKEN in your environment");
    process.exit(1);
  }

  const text = "This is a test sentence for embedding.";

  try {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction",
        {
            method: "POST",
            headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HF API error ${response.status}:`, errorText);
      process.exit(1);
    }

    const data = await response.json();

    console.log("✅ Embedding API response:");
    console.dir(data, { depth: null, colors: true });

    if (Array.isArray(data)) {
        if (data.length > 0) {
            if (Array.isArray(data[0])) {
            // Nested array, take first element
            console.log(`Embedding vector length: ${data[0].length}`);
            console.log(`First 5 elements: ${data[0].slice(0, 5).join(", ")}`);
            } else {
            // Flat array
            console.log(`Embedding vector length: ${data.length}`);
            console.log(`First 5 elements: ${data.slice(0, 5).join(", ")}`);
            }
        } else {
            console.error("❌ Empty embedding array");
        }
        } else {
        console.error("❌ Unexpected embedding response format");
    }
  } catch (error) {
    console.error("❌ Error fetching embedding:", error);
  }
}

testEmbedding();
