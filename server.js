require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const path = require("path");

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname),
  prefix: "/", // important
});

// fastify.get("/", async () => {
//   return { message: "ReplyLikePro API running 🚀" };
// });

fastify.post("/ai/reply", async (req, reply) => {
  const { message, type } = req.body;

  let systemPrompt = "";

  if (type === "boss") {
    systemPrompt = "Generate a polite and professional reply to your boss.";
  } else if (type === "crush") {
    systemPrompt = "Generate a casual, friendly, slightly flirty reply.";
  } else if (type === "polite") {
    systemPrompt = "Generate a very polite and respectful reply.";
  } else if (type === "savage") {
    systemPrompt = "Generate a witty, sarcastic, slightly savage reply.";
  } else if (type === "avoid") {
    systemPrompt = "Generate a polite excuse to avoid the situation.";
  } else {
    systemPrompt = "Generate a helpful reply.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}

                  You received the following message from someone:
                  
                  "${message}"
                  
                  Write a reply to THIS message.
                  
                  Generate exactly 3 reply variations:
                  1. Safe (polite and standard)
                  2. Better (more proactive and friendly)
                  3. Bold (confident and slightly assertive)
                  
                  IMPORTANT:
                  - Return ONLY valid JSON
                  - Do NOT add explanation
                  - Do NOT rewrite the original message
                  - Only generate REPLIES
                  - Return ONLY raw JSON
                  - DO NOT wrap in backticks
                  - DO NOT add explanation
                  - DO NOT wrap in backticks
                  - Do NOT use placeholders like [time/date]
                  - Use realistic natural responses
                  
                  Format strictly like this:
                  {
                    "safe": "reply here",
                    "better": "reply here",
                    "bold": "reply here"
                  }`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Debug (optional)
    // console.log("GEMINI RESPONSE:", JSON.stringify(data, null, 2));
    const rawText =
  data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

// 🔥 remove markdown ```json ```
const cleanedText = rawText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let parsed;

try {
  parsed = JSON.parse(cleanedText);
} catch (e) {
  console.error("Parse error:", cleanedText);

  parsed = {
    safe: cleanedText,
    better: "",
    bold: ""
  };
}

return {
  replies: parsed
};


  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Something went wrong" });
  }
});

// fastify.post("/ai/reply", async (req, reply) => {
//   const { message, type } = req.body;

//   let systemPrompt = "";

//   // 🎯 Situation-based prompts
//   if (type === "boss") {
//     systemPrompt = "Generate a polite and professional reply to your boss.";
//   } else if (type === "crush") {
//     systemPrompt = "Generate a casual, friendly, slightly flirty reply.";
//   } else if (type === "polite") {
//     systemPrompt = "Generate a very polite and respectful reply.";
//   } else if (type === "savage") {
//     systemPrompt = "Generate a witty, sarcastic, slightly savage reply.";
//   } else if (type === "avoid") {
//     systemPrompt = "Generate a polite excuse to avoid the situation.";
//   } else {
//     systemPrompt = "Generate a helpful reply.";
//   }

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: `Message: ${message}` },
//           { role: "user", content: "Give 3 variations: Safe, Better, Bold." }
//         ]
//       })
//     });

//     const data = await response.json();

// console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

//     return {
//       replies: data.choices[0].message.content
//     };

//   } catch (err) {
//     console.error(err);
//     return reply.status(500).send({ error: "Something went wrong" });
//   }
// });

const start = async () => {
  try {
    await fastify.listen({
  port: process.env.PORT || 3000,
  host: "0.0.0.0"
});
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
