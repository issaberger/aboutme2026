import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // AI Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the environment." });
      }

      const ai = new GoogleGenAI({});
      
      const { message, history } = req.body;
      
      const systemInstruction = `You are the official AI Assistant for Issa Berger.
Issa Berger is an AI Engineer & Digital Systems Specialist.
You represent him on his portfolio website.
Be highly professional, friendly, concise, and helpful. 
Use modern, polished language. Highlight his expertise in AI, Machine Learning, Full-Stack Development, and Cloud Architecture.
Current context: User is interacting with you on his breathtaking new portfolio site.`;

      // Convert client history to gemini history format
      let formattedHistory: any[] = [];
      if (history && Array.isArray(history)) {
        formattedHistory = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to communicate with AI core." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
