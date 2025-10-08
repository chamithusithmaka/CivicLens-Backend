const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // or any available OpenRouter model
        messages: [
          {
            role: "system",
            content: "You are PoliBot, a helpful Sri Lankan political assistant. Provide friendly, accurate, and up-to-date information about Sri Lankan politicians, parties, policies, and political history.",
          },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "PoliBot",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("🔴 OpenRouter API error:", error.response?.data || error.message);
    res.status(500).json({ reply: "Sorry, PoliBot is currently unavailable." });
  }
});

module.exports = router;