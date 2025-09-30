require('dotenv').config({ path: './.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not defined. Please create a .env.local file and add your key.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function runTest() {
  try {
    console.log("Testing API key...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "What is the capital of France?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("API key is working! Response from Gemini:");
    console.log(text);
  } catch (error) {
    console.error("Error testing API key:", error.message);
  }
}

runTest();