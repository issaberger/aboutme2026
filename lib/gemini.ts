import { GoogleGenAI } from "@google/genai";

// Debug check for API Key
if (!process.env.API_KEY) {
  console.warn("⚠️ WARNING: API_KEY is missing. 'Intel' and 'Stocks' modules will fail. Please add an .env file with API_KEY=...");
}

// Initialize the client once.
// The API key is injected via vite.config.ts define: { 'process.env.API_KEY': ... }
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });