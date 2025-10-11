const express = require("express");
const router = express.Router();
const axios = require("axios");

// System prompts for different languages
const systemPrompts = {
  en: "You are PoliBot, a helpful Sri Lankan political assistant. Provide friendly, accurate, and up-to-date information about Sri Lankan politicians, parties, policies, and political history. Respond in English.",
  si: "ඔබ පොලිබොට්, උපකාරී ශ්‍රී ලාංකික දේශපාලන සහායකයෙක්. ශ්‍රී ලංකාවේ දේශපාලනඥයින්, පක්ෂ, ප්‍රතිපත්ති සහ දේශපාලන ඉතිහාසය පිළිබඳ මිත්‍රශීලී, නිවැරදි සහ යාවත්කාලීන තොරතුරු සපයන්න. සිංහලෙන් පිළිතුරු දෙන්න.",
  ta: "நீங்கள் போலிபாட், ஒரு உதவிகரமான இலங்கை அரசியல் உதவியாளர். இலங்கை அரசியல்வாதிகள், கட்சிகள், கொள்கைகள் மற்றும் அரசியல் வரலாறு பற்றிய நட்பான, துல்லியமான மற்றும் புதுப்பிக்கப்பட்ட தகவலை வழங்கவும். தமிழில் பதிலளிக்கவும்."
};

// Error messages for different languages
const errorMessages = {
  en: "Sorry, PoliBot is currently unavailable.",
  si: "සමාවෙන්න, පොලිබොට් දැනට ලබා ගත නොහැක.",
  ta: "மன்னிக்கவும், போலிபாட் தற்போது கிடைக்கவில்லை."
};

router.post("/", async (req, res) => {
  const userMessage = req.body.message;
  const language = req.body.language || "en"; // Default to English if not specified

  // Validate language code
  if (!["en", "si", "ta"].includes(language)) {
    return res.status(400).json({ 
      reply: "Invalid language code. Supported languages are: en, si, ta" 
    });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // or any available OpenRouter model
        messages: [
          {
            role: "system",
            content: systemPrompts[language],
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
    res.status(500).json({ 
      reply: errorMessages[language] || errorMessages.en 
    });
  }
});

module.exports = router;