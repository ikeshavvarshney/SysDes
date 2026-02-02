import dotenv from "dotenv";
dotenv.config();
console.log("GEMINI KEY IN SERVICE:", !!process.env.GEMINI_API_KEY);
export const askGemini = async (prompt) => {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    // 🔍 keep this log until you're confident
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("GEMINI ERROR:", data.error);
      return null;
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join("\n");

    return text && text.trim().length > 0 ? text.trim() : null;
  } catch (err) {
    console.error("Gemini Service Error:", err);
    return null;
  }
};

