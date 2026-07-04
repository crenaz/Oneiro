import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Dynamic model alias from skill guidelines
const MODEL_NAME = "gemini-3.5-flash";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simulated data as a rich fallback if no API key is provided
const FALLBACK_DREAMS: Record<string, any> = {
  cathedral: {
    title: "The Glass Cathedral",
    dominantEmotion: "Wonder",
    lucidity: "High",
    summary: "The Glass Cathedral represents intellectual growth and self-discovery, yet also highlights a fragile structure of reality. The refracting light suggests a search for spiritual transparency.",
    symbols: [
      { name: "Crystal Cathedral", frequency: 94, trend: "up", score: 94, description: "Represents absolute clarity, structured beliefs, and spiritual aspiration." },
      { name: "Indigo Light", frequency: 82, trend: "up", score: 82, description: "Associated with deep intuition, third-eye vision, and cosmic intelligence." },
      { name: "Refracting Prism", frequency: 45, trend: "down", score: 45, description: "A tool that breaks down monolithic ideas into diverse colored insights." }
    ],
    emotions: [
      { name: "Transcendence", score: 88, description: "A feeling of soaring above the ego or physical limitations." },
      { name: "Serenity", score: 76, description: "A calm, still pool of mental awareness." }
    ],
    archetypes: [
      { name: "The Sage", score: 65, description: "The internal searcher of ancient wisdom and cosmic principles." },
      { name: "The Creator", score: 41, description: "The designer of the internal landscape and physical glass structures." }
    ],
    artworkPrompt: "A cinematic digital painting of a colossal cathedral made of vibrant refracting glass in a deep violet space with floating particles.",
    artworkSeed: 4812,
    agentLogs: [
      ">> analyzing_text_vector...",
      ">> symbol_match_found: \"cathedral\"",
      ">> emotion_detected: \"wonder\" (0.88)",
      ">> triggering_visual_gen_pipeline...",
      ">> buffer_flushed_success"
    ]
  },
  ocean: {
    title: "The Lucid Ocean",
    dominantEmotion: "Calm",
    lucidity: "High",
    summary: "A peaceful transition across the vast waters of the subconscious. Floating above liquid glass oceans represents emotional stability and suspended fear.",
    symbols: [
      { name: "Bioluminescent Sea", frequency: 82, trend: "up", score: 82, description: "Deep subconscious depths illuminated by glowing ideas." },
      { name: "Liquid Glass", frequency: 64, trend: "up", score: 64, description: "Emotions that have solidified into a reflective, calm surface." },
      { name: "Suspended Stars", frequency: 38, trend: "down", score: 38, description: "Cosmic guidelines reflected onto the personal psyche." }
    ],
    emotions: [
      { name: "Wonder", score: 91, description: "Awe at the sheer beauty of the universe." },
      { name: "Serenity", score: 85, description: "Mental quietness and deep peace." }
    ],
    archetypes: [
      { name: "The Seeker", score: 78, description: "The wanderer traveling across vast horizons of space." },
      { name: "The Innocent", score: 50, description: "Unconditional trust in the flow of the cosmos." }
    ],
    artworkPrompt: "Generative abstract digital art of an ocean made of glowing bioluminescent particles under a lavender sky.",
    artworkSeed: 9021,
    agentLogs: [
      ">> normalizer_scale: 1.442",
      ">> vectorizing_semantic_peaks...",
      ">> emotion_detected: \"calm\" (0.91)",
      ">> generating_ambient_mesh...",
      ">> render_complete"
    ]
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, mood } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const ai = getGeminiClient();

    // If no client, do smart keyword matching or fallback
    if (!ai) {
      const lowerText = text.toLowerCase();
      let matched = FALLBACK_DREAMS.cathedral;
      if (lowerText.includes("ocean") || lowerText.includes("sea") || lowerText.includes("water") || mood === "Calm") {
        matched = FALLBACK_DREAMS.ocean;
      }
      
      // Let's customize the fallback slightly with the user's title if present
      const randomizedSeed = Math.floor(Math.random() * 10000);
      return NextResponse.json({
        ...matched,
        title: body.title || matched.title,
        artworkSeed: randomizedSeed,
        normalizedText: text,
        _simulated: true,
      });
    }

    // Call Gemini API to extract dream insights as a JSON object
    const prompt = `
You are the Oneiromantia Subconscious Multi-Agent Analyzer. Analyze this dream journal entry.
Return a structured JSON object strictly matching this schema:
{
  "title": "A short poetic title for the dream (maximum 4 words)",
  "dominantEmotion": "One of: Wonder, Eerie, Calm, Chaos, Vague",
  "lucidity": "One of: High, Medium, Low",
  "summary": "A deep Jungian summary of the dream meaning (2-3 sentences)",
  "symbols": [
    {
      "name": "Name of the symbol",
      "frequency": 82,
      "trend": "up or down",
      "score": 85,
      "description": "Short explanation of this symbol's meaning in the subconscious"
    }
  ],
  "emotions": [
    {
      "name": "Name of emotion",
      "score": 90,
      "description": "Short explanation of why this emotion was active"
    }
  ],
  "archetypes": [
    {
      "name": "The Sage, The Shadow, The Hero, The Creator, The Seeker, or The Innocent",
      "score": 75,
      "description": "Jungian explanation of this archetype's activity in this dream"
    }
  ],
  "artworkPrompt": "An evocative, detailed prompt for generating a p5.js generative shader or digital surreal artwork representing this dream (e.g. 'A surrealist digital painting of... with purples and cyan accents')",
  "artworkSeed": 1234,
  "agentLogs": [
    "A list of 5 simulated python multi-agent log tracing strings with timestamps, timing metrics, and token counts (e.g. '>> analyzing_text_vector...')"
  ]
}

Dream entry to analyze:
Title: "${body.title || 'Untitled'}"
Mood Selected: "${mood || 'Unknown'}"
Dream Content:
"${text}"
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert Jungian psychologist, dream interpreter, and generative artist agent. Analyze input dreams and return structured, poetic, and analytical insights in JSON.",
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(resultText.trim());
    return NextResponse.json({
      ...data,
      normalizedText: text,
      _simulated: false,
    });

  } catch (error: any) {
    console.error("Gemini Dream Analysis Error:", error);
    return NextResponse.json({
      error: "Failed to analyze dream. Falling back to internal engine.",
      details: error.message,
    }, { status: 500 });
  }
}
