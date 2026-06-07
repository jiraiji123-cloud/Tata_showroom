import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Shared lazy-initialized Gemini SDK client
let genAIClient: any = null;

function getGeminiClient() {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      genAIClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return genAIClient;
}

// REST API endpoints

// Health check and configuration status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    supabaseConfigured: !!process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL !== "YOUR_SUPABASE_URL",
  });
});

// Post endpoint for Smart Tata Car Selection utilizing Gemini-3.5
app.post("/api/gemini/recommend-car", async (req: express.Request, res: express.Response) => {
  const { dialogueHistory, userPreferences } = req.body;

  const client = getGeminiClient();

  // If Gemini API is not configured yet, response with fallback intelligence
  if (!client) {
    console.warn("GEMINI_API_KEY workspace secret is absent. Prompting offline companion responses.");
    return res.json({
      aiMessage: getLocalShowroomResponse(userPreferences || {}),
      suggestedCarId: inferSuggestedCar(userPreferences || {})
    });
  }

  // Format preference parameters
  const budget = userPreferences?.maxBudget ? `${userPreferences.maxBudget} Lakhs` : "Any";
  const energy = userPreferences?.fuelPreference || "Any";
  const seating = userPreferences?.seatingNeed || "Any";
  const style = userPreferences?.styleValue || "Balanced mileage and build quality";

  const promptInput = `
A customer is looking for advice to match them with a Tata car.
Customer Preference Parameters:
- Maximum Budget of: ${budget}
- Fuel Priority: ${energy}
- Seating Configuration: ${seating}
- Priority focus: ${style}

Dialogue logs so far:
${JSON.stringify(dialogueHistory || [])}

Provide a short, extremely premium, professional response in 2-3 sentences. Recommending the optimal Tata Car (e.g. TATA CURVV.ev, TATA SAFARI, TATA NEXON.ev, TATA HARRIER, TATA PUNCH.ev, TATA ALTROZ). Highlight safety (their 5-Star impact rating structures) and electric capability where appropriate. Keep it concise, similar to how a luxury Tesla/Tata concierge would communicate.
`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInput,
      config: {
        systemInstruction: `You are the chief concierge for TATA Passenger Vehicles. You are professional, tech-focused, elegant and highly knowledgeable about structural safety, acti.ev architectures, OMEGARC platforms, battery management systems, and smart modern styling. Recommend specific vehicles like the CURVV.ev (SUV Coupe), SAFARI (Flagship luxury 3-row SUV), NEXON.ev (cutting-edge technological premium EV), HARRIER (pedigree athletic SUV), PUNCH.ev (urban micro-EV SUV), or ALTROZ (premium 5-star safety hatchback). Keep answers to the point, welcoming, and drive them to schedule a test-drive in our showroom.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiMessage: { type: Type.STRING, description: "Elegant personalized response for the user recommendation" },
            suggestedCarId: { 
              type: Type.STRING, 
              description: "Must match one of these ids: tata-curvv-ev, tata-safari, tata-nexon-ev, tata-harrier, tata-punch-ev, tata-altroz" 
            }
          },
          required: ["aiMessage", "suggestedCarId"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.json(parsedData);
  } catch (error) {
    console.error("Gemini recommendation failed: ", error);
    return res.json({
      aiMessage: `Regarding your requirement for a ${seating} car prioritizing ${style}, we highly recommend scheduling a customized walkthrough. Our TATA Passenger Vehicles hold unparalleled 5-Star safety credentials and state-of-the-art powertrains. Let's arrange a test drive to experience the drive.`,
      suggestedCarId: inferSuggestedCar(userPreferences || {})
    });
  }
});

// Offline intelligent rule-based matching backup
function getLocalShowroomResponse(prefs: any): string {
  const fuel = prefs.fuelPreference || 'Any';
  const seating = prefs.seatingNeed || 'Any';

  if (fuel === 'EV') {
    return "To embrace next-generation zero-emission travel, we highly recommend the revolutionary TATA CURVV.ev or TATA NEXON.ev. Built on our ultra-advanced acti.ev structure, they feature V2V charging, high cinematic HUD, and 500+ km of absolute range. Let's schedule a test drive next week!";
  }
  if (seating === '6-7') {
    return "For luxurious family journeys, the monumental TATA SAFARI SUV commands the segment. Derived from Land Rover's iconic architectural lineage, it features majestic captain seating, advanced multi-mood ambient tracks, and premium structural defense.";
  }
  return "With TATA's legendary GNCAP 5-Star safety frameworks, every model on our floor is engineered to defend your family. Whether you choose the agile Altroz, the tech-focused Nexon, or the coupe-silhouette Curvv, you experience the pinnacle of Indian engineering. We would love to book a test drive for you.";
}

function inferSuggestedCar(prefs: any): string {
  const fuel = prefs.fuelPreference || 'Any';
  const seating = prefs.seatingNeed || 'Any';
  
  if (fuel === 'EV') {
    return "tata-curvv-ev";
  }
  if (seating === '6-7') {
    return "tata-safari";
  }
  if (prefs.maxBudget < 12) {
    return "tata-altroz";
  }
  return "tata-harrier";
}

// Vite integration server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Showroom Server] Tata Car Showroom running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
