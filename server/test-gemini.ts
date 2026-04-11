import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error("Please provide an API key");
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const res = await model.embedContent("hello world");
    console.log("text-embedding-004 success:", res.embedding.values.length);
  } catch (e) {
    console.error("text-embedding-004 error:", e.message);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const res = await model.embedContent("hello world");
    console.log("embedding-001 success:", res.embedding.values.length);
  } catch (e) {
    console.error("embedding-001 error:", e.message);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
    const res = await model.embedContent("hello world");
    console.log("models/text-embedding-004 success:", res.embedding.values.length);
  } catch (e) {
    console.error("models/text-embedding-004 error:", e.message);
  }
}

run();