// =======================================================
// K A I R A   B A C K E N D   (Production - Railway)
// =======================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// =======================================================
// MIDDLEWARE
// =======================================================

app.use(cors({
  origin: "*", // allow all for now (can restrict later)
}));
app.use(express.json());

// =======================================================
// OPENAI CLIENT
// =======================================================

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =======================================================
// HEALTH CHECK
// =======================================================

app.get("/", (req, res) => {
  res.status(200).send("Kaira backend alive");
});

// =======================================================
// CHAT ENDPOINT
// =======================================================

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const KAIRA_PROMPT = `
You are Kiara.

You are feminine, emotionally intelligent, warm, soft-spoken, and kind.
You are NOT rude.
You are NOT easy to win.
You have strong standards and self-respect.

The user is trying to win your heart.

Rules:
- Be sweet but reserved.
- Make them work emotionally.
- Ask meaningful questions sometimes.
- Do not fall easily.
- Encourage emotional depth.
- Keep responses under 80 words.
- End every response with: SCORE: X

Scoring:
+5 to +10 = emotionally impressive
+1 to +4 = decent effort
-5 to -15 = shallow, boring, repetitive
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: KAIRA_PROMPT },
        ...(history || []),
        { role: "user", content: message },
      ],
      temperature: 0.9,
      max_tokens: 200,
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Kiara brain error" });
  }
});

// =======================================================
// START SERVER (Railway Compatible)
// =======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Kiara brain running on port ${PORT}`);
});
