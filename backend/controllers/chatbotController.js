// ==========================================
// AI CHATBOT CONTROLLER (HYBRID: RULES + GEMINI)
// ==========================================

import { askGemini } from "../services/geminiService.js";
// import Design from "../models/Design.js"; // enable when model exists

// ------------------------------------------
// Constants
// ------------------------------------------

const GREETINGS = [
  "hi",
  "hello",
  "hey",
  "hey there",
  "yo",
  "sup",
  "hii",
  "hiii",
];

// Rule-based design patterns
const DESIGN_PATTERNS = {
  high_traffic: {
    keywords: ["scale", "many users", "high traffic", "millions", "popular"],
    suggestions: [
      { type: "LOAD_BALANCER", reason: "Distribute traffic across multiple servers" },
      { type: "CACHE", reason: "Reduce database load with caching" },
      { type: "CDN", reason: "Serve static content faster globally" },
    ],
    template: "SCALABLE_WEB_APP",
  },

  data_heavy: {
    keywords: ["analytics", "big data", "processing", "reports", "database"],
    suggestions: [
      { type: "NOSQL", reason: "NoSQL handles large datasets better" },
      { type: "QUEUE", reason: "Process data asynchronously" },
      { type: "CACHE", reason: "Cache frequently accessed data" },
    ],
    template: "DATA_PIPELINE",
  },

  real_time: {
    keywords: ["real-time", "live", "websocket", "chat", "streaming"],
    suggestions: [
      { type: "QUEUE", reason: "Handle real-time message queues" },
      { type: "LOAD_BALANCER", reason: "Manage concurrent connections" },
      { type: "CACHE", reason: "Store session data" },
    ],
    template: "REALTIME_APP",
  },

  microservices: {
    keywords: ["microservice", "distributed", "api gateway", "services"],
    suggestions: [
      { type: "API_GATEWAY", reason: "Central entry point for microservices" },
      { type: "QUEUE", reason: "Async communication between services" },
      { type: "SERVICE_MESH", reason: "Service discovery and traffic control" },
    ],
    template: "MICROSERVICES_ARCH",
  },

  simple_app: {
    keywords: ["simple", "basic", "small", "prototype", "mvp"],
    suggestions: [
      { type: "SERVER", reason: "Single server for application logic" },
      { type: "DB", reason: "Database for data persistence" },
    ],
    template: "BASIC_WEB_APP",
  },
};

// ------------------------------------------
// MAIN CHATBOT CONTROLLER
// ------------------------------------------

export const getChatbotSuggestion = async (req, res) => {
  try {
    const { userMessage, designId } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({
        reply: "Please ask a valid question.",
        suggestions: [],
        confidence: "low",
        source: "system",
      });
    }

    const lowerMsg = userMessage.toLowerCase().trim();

    // --------------------------------------
    // 1️⃣ Greetings / small talk
    // --------------------------------------
    if (GREETINGS.includes(lowerMsg)) {
      return res.status(200).json({
        reply:
          "Hey 👋 I help you design real-world systems.\n\nTell me what you're building, for example:\n• high traffic chat app\n• scalable e-commerce system\n• real-time analytics pipeline",
        suggestions: [],
        recommendedTemplate: null,
        confidence: "low",
        source: "system",
      });
    }

    // --------------------------------------
    // 2️⃣ Rule-based intent analysis
    // --------------------------------------
    let matchedPattern = null;
    let highestScore = 0;

    for (const [name, pattern] of Object.entries(DESIGN_PATTERNS)) {
      const score = pattern.keywords.filter((kw) =>
        lowerMsg.includes(kw)
      ).length;

      if (score > highestScore) {
        highestScore = score;
        matchedPattern = { name, ...pattern };
      }
    }

    // --------------------------------------
    // 3️⃣ Gemini fallback (conceptual / behavioural)
    // --------------------------------------
    if (!matchedPattern || highestScore === 0) {
      const geminiReply = await askGemini(`
You are a helpful AI assistant.

Answer naturally like a normal conversational AI.
If the question is about system design, explain clearly with examples.
If the question is casual or conversational, respond normally.

User question:
${userMessage}
      `);

      return res.status(200).json({
        reply:
          geminiReply ??
          "I’m here to help 🙂 What would you like to know?",
        suggestions: [],
        recommendedTemplate: null,
        confidence: "low",
        source: "gemini",
      });
    }

    // --------------------------------------
    // 4️⃣ Rule-based architecture response
    // --------------------------------------
    const reply = `Based on your requirements, a **${matchedPattern.name.replace(
      "_",
      " "
    )}** architecture fits best.`;

    const suggestions = matchedPattern.suggestions.map((s, index) => ({
      component: s.type,
      reason: s.reason,
      priority: index + 1,
    }));

    // --------------------------------------
    // 5️⃣ Optional design analysis
    // --------------------------------------
    let designAnalysis = null;

    if (designId) {
      try {
        const design = await Design.findById(designId).populate("components");

        if (design) {
          const existing = design.components.map((c) => c.type);
          const missing = matchedPattern.suggestions
            .filter((s) => !existing.includes(s.type))
            .map((s) => s.type);

          designAnalysis = {
            currentComponents: existing,
            missingComponents: missing,
            status: missing.length === 0 ? "complete" : "incomplete",
          };
        }
      } catch {
        // silently ignore design lookup errors
      }
    }

    return res.status(200).json({
      reply,
      suggestions,
      recommendedTemplate: matchedPattern.template,
      designAnalysis,
      confidence: highestScore > 2 ? "high" : "medium",
      source: "rules",
    });
  } catch (error) {
    console.error("Chatbot Error:", error);

    // HARD fallback – never return blank
    return res.status(200).json({
      reply:
        "Something went wrong on my side. Try rephrasing your question.",
      suggestions: [],
      confidence: "low",
      source: "system",
    });
  }
};

// ==========================================
// OPTIMIZATION TIPS CONTROLLER (UNCHANGED LOGIC)
// ==========================================

export const getOptimizationTips = async (req, res) => {
  try {
    const { designId } = req.params;

    const design = await Design.findById(designId).populate("components");
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    const tips = [];
    const components = design.components;
    const types = components.map((c) => c.type);

    // Load balancer check
    if (
      components.filter((c) => c.type === "SERVER").length > 1 &&
      !types.includes("LOAD_BALANCER")
    ) {
      tips.push({
        type: "WARNING",
        title: "Missing Load Balancer",
        description: "Multiple servers without a load balancer.",
        action: { addComponent: "LOAD_BALANCER" },
      });
    }

    // Cache check
    if (
      (types.includes("DB") || types.includes("NOSQL")) &&
      !types.includes("CACHE")
    ) {
      tips.push({
        type: "SUGGESTION",
        title: "Add Cache",
        description: "Caching reduces database load significantly.",
        action: { addComponent: "CACHE" },
      });
    }

    // CDN check
    if (components.length > 4 && !types.includes("CDN")) {
      tips.push({
        type: "SUGGESTION",
        title: "Add CDN",
        description: "CDN improves performance and scalability.",
        action: { addComponent: "CDN" },
      });
    }

    return res.status(200).json({
      designId,
      tips,
      overallHealth: tips.some((t) => t.type === "WARNING")
        ? "needs_improvement"
        : "good",
    });
  } catch (error) {
    console.error("Optimization Error:", error);
    return res.status(500).json({
      message: "Optimization analysis failed",
    });
  }
};
