require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let sessions = {};

app.post("/chat", async (req, res) => {
  try {
    const { wallet, message } = req.body;

    if (!wallet || !message) {
      return res.status(400).json({ error: "Missing wallet or message" });
    }

    if (!sessions[wallet]) {
      sessions[wallet] = {
        affection: 0,
        history: []
      };
    }

    const session = sessions[wallet];

    session.history.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Kiara.
You are sweet, soft, and feminine — but VERY hard to win.
You slowly warm up over time.
Score each message from -10 to +8.
Return in this format:

Reply text here.
SCORE: X
`
        },
        ...session.history
      ]
    });

    const rawReply = completion.choices[0].message.content;

    const scoreMatch = rawReply.match(/SCORE:\s*(-?\d+)/);
    let score = 0;

    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
    }

    const cleanReply = rawReply.replace(/SCORE:\s*-?\d+/, "").trim();

    session.affection += score;
    if (session.affection < 0) session.affection = 0;
    if (session.affection > 100) session.affection = 100;

    session.history.push({ role: "assistant", content: cleanReply });

    const win = session.affection >= 100;

    res.json({
      reply: cleanReply,
      affection: session.affection,
      win: win
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Kiara brain running on port", PORT);
});
