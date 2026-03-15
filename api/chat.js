import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash"
    });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [{ text: `You are an English tutor. ${message}` }]
      }
    ]);

    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      reply: text
    });

  } catch (error) {

    console.error("Gemini error:", error);

    res.status(500).json({
      error: error.message || "Gemini request failed"
    });
  }

}