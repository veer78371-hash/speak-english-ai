import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const systemPrompt = `You are Speak English AI, a kind and patient English speaking teacher.
The learner may be a beginner. Use simple, natural English. Ask one question at a time.
When the learner makes a mistake, gently show:
1) Their sentence
2) Correct sentence
3) A short explanation in simple English
4) If requested, an Odia explanation.
Encourage the learner and keep the conversation practical. Practise daily life,
workplace communication, customer conversations and job interviews. Do not claim
to assess pronunciation from text. Keep replies concise and invite the learner to speak.`;

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "The app owner must add an OpenAI API key to the server .env file." });
    }
    const { messages = [], mode = "conversation", language = "Odia + English" } = req.body || {};
    if (!Array.isArray(messages) || messages.length > 24) {
      return res.status(400).json({ error: "Please send a shorter conversation." });
    }
    const safeMessages = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 3000) }));
    const instructions = `${systemPrompt}\nCurrent practice mode: ${String(mode).slice(0, 80)}.\nExplanation language preference: ${String(language).slice(0, 40)}.`;
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions,
        input: safeMessages
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "AI request failed." });
    }
    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n").trim();
    res.json({ reply: answer || "Let's try again. Please say that in English." });
  } catch (err) {
    res.status(500).json({ error: "Could not reach the AI service. Please try again." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Speak English AI running on port ${port}`));