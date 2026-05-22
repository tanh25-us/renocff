import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy client initializer for security and fast startup as instructed
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// 1. API: HEALTH ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. API: GEMINI POWERED ARTISANAL RECIPE GENERATOR WITH STRUCTURED OUTPUT SCHEMA
app.post('/api/ai/recipe', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'System Prompt is strictly required.' });
  }

  try {
    const ai = getAiClient();
    
    const systemPrompt = `You are an elite, Michelin-star quality master barista and specialty coffee roaster consultant for "Reno Coffee".
Your task is to craft high-fidelity, meticulously professional brewing and extraction recipes.
Return a structured JSON output reflecting the recipe instructions. Values must follow these limits:
- name: Unique, luxurious, elegant title (e.g. "Ethereal Gedeo Slow Drip")
- type: Strictly one of the enum: ["Espresso", "Filter", "Cold Brew", "Signature"]
- origin: Specific single-origin coffee bean farm/crop model
- grindSetting: Decimal scale form 1.0 (very fine) to 10.0 (very coarse)
- extractionTime: Whole number represent seconds (for cold brew it can be 64800, for hot brew e.g. 180 to 240)
- waterTemp: Thermal degree Celsius whole number (e.g. 91 to 96)
- ratio: Brew ratio (e.g. "1:2", "1:15")
- acidity: Rating scale 1 to 5
- body: Rating scale 1 to 5
- sweetness: Rating scale 1 to 5
- bitterness: Rating scale 1 to 5
- instructions: Detailed, step-by-step master brewing tips list`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Draft a specialty recipe based on the request: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipe: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Espresso', 'Filter', 'Cold Brew', 'Signature'] },
                origin: { type: Type.STRING },
                grindSetting: { type: Type.NUMBER },
                extractionTime: { type: Type.NUMBER },
                waterTemp: { type: Type.NUMBER },
                ratio: { type: Type.STRING },
                acidity: { type: Type.NUMBER },
                body: { type: Type.NUMBER },
                sweetness: { type: Type.NUMBER },
                bitterness: { type: Type.NUMBER },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['name', 'type', 'origin', 'grindSetting', 'extractionTime', 'waterTemp', 'ratio', 'acidity', 'body', 'sweetness', 'bitterness', 'instructions']
            }
          },
          required: ['recipe']
        }
      }
    });

    const responseText = response.text || '';
    const parsedData = JSON.parse(responseText);
    
    res.json({ recipe: parsedData.recipe });
  } catch (error: any) {
    console.error('Gemini recipe generation exception:', error);
    // Propagate fallback-friendly error response containing root cause detail
    res.status(500).json({ 
      error: 'Failed to compile AI recipe.', 
      details: error.message || 'Unknown network error. Fallback rules available.' 
    });
  }
});

// 3. SEAMLESS VITE OR STATIC SERVING MIDDLEWARE
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite developer mode middleware active.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static client files fallback integrated.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reno Coffee Management server successfully running on port ${PORT}`);
  });
}

initializeServer().catch(err => {
  console.error('Fatal dev server initialization failure:', err);
});
