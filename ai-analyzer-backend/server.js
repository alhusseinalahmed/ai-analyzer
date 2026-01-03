require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// 1. Setup the AI Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
app.post("/analyze", async (req, res) => {
    try {
        const { userCode, mode } = req.body; // <--- Now receiving 'mode'

        // Define different personas for the AI
        const promptModifiers = {
            "default": "You are a helpful Senior Dev. Rate cleanliness 1-10. Find bugs. Suggest improvements.",
            "security": "You are a Cyber Security Expert. Focus ONLY on vulnerabilities (XSS, Injection, Memory leaks). Be critical.",
            "pirate": "You are a Pirate Captain coder. Speak like a pirate! 🏴‍☠️ Focus on 'mutinies' (bugs) and 'treasure' (optimization).",
            "roast": "You are a mean tech lead. Roast this code. Be funny but harsh. Tell me why it belongs in the trash."

        };

        const selectedModifier = promptModifiers[mode] || promptModifiers["default"];

        const prompt = `
      ${selectedModifier}
      
      Here is the code to analyze:
      ${userCode}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ analysis: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong with the AI." });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));