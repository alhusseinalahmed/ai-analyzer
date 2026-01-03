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
        const { userCode } = req.body;

        // 2. The "Prompt Engineering" part
        // We tell the AI strictly how to behave.
        const prompt = `
      You are a Senior Software Engineer reviewing code for a junior developer.
      Analyze the following code snippet. 
      1. Rate it from 1-10 on cleanliness and efficiency.
      2. Point out any potential bugs.
      3. Suggest one specific way to improve it using modern best practices.
      
      Here is the code:
      ${userCode}
    `;

        // 3. Send to Google
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Send back to Frontend
        res.json({ analysis: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong with the AI." });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));