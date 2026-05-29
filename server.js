require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Gemini API Configuration
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Category to prompt descriptions
const CATEGORY_PROMPTS = {
  'all':        'any topic: world history, science, geography, arts, culture, sports, technology, nature, or general knowledge',
  'history':    'world history — ancient civilizations, empires, wars, revolutions, and key historical events across all continents',
  'culture':    'global arts, music, literature, food, traditions, festivals, mythology, and pop culture from around the world',
  'geography':  'world geography — countries, capitals, continents, landmarks, rivers, mountains, oceans, and flags',
  'government': 'world governments, political systems, international organizations, famous leaders, constitutions, and civics'
};

// Check if Gemini API key is configured on the server
app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// Endpoint: Generate Trivia Questions
app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  const { category, difficulty } = req.body;
  const catPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['all'];
  const diffDesc = {
    easy:   'beginner-friendly, widely-known facts',
    medium: 'moderate — requires some study',
    hard:   'challenging, expert-level knowledge'
  }[difficulty] || 'beginner-friendly';

  const prompt = `Generate exactly 20 multiple-choice trivia questions about ${catPrompt}.
Difficulty: ${difficulty} (${diffDesc}).
Ensure questions are highly unique, diverse, and cover obscure but interesting facts to avoid recycling questions across sessions. Seed: ${Date.now()}.
Each question needs exactly 4 answer options. Only one is correct.
"ans" is the 0-based index of the correct option.
Respond with ONLY a JSON array, nothing else:
[
  {
    "q": "What is the capital of France?",
    "opts": ["London", "Berlin", "Paris", "Madrid"],
    "ans": 2,
    "emoji": "🏙️",
    "cat": "${category}",
    "diff": "${difficulty}"
  }
]`;

  try {
    const response = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 8192 }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', response.status, errData);
      return res.status(response.status).json({
        error: errData?.error?.message || `Gemini API returned status ${response.status}`
      });
    }

    const data = await response.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Strip potential markdown fences
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/(\[\s*\{[\s\S]*\}\s*\])/);
      if (match) {
        parsedQuestions = JSON.parse(match[1]);
      } else {
        throw new Error('Invalid JSON format returned from Gemini.');
      }
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error('Gemini returned empty or invalid question array.');
    }

    res.json(parsedQuestions);
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate trivia questions.' });
  }
});

// Endpoint: Generate Fun Fact
app.post('/api/funfact', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  const { questionText } = req.body;
  const prompt = `Give me one surprising fun fact related to: "${questionText || 'world trivia'}"
Keep it to 1-2 sentences. Make it educational and interesting.
Respond with ONLY this JSON, nothing else:
{"emoji": "💡", "text": "Your fun fact here."}`;

  try {
    const response = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to generate fun fact from Gemini.' });
    }

    const data = await response.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let fact;
    try {
      fact = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/(\{[\s\S]*\})/);
      if (match) fact = JSON.parse(match[1]);
    }

    if (fact && fact.text) {
      res.json(fact);
    } else {
      res.status(500).json({ error: 'Invalid fun fact response structure.' });
    }
  } catch (error) {
    console.error('Fun fact error:', error);
    res.status(500).json({ error: 'Failed to generate fun fact.' });
  }
});

// Endpoint: Chat/Explain More
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  const { factText, message } = req.body;
  const prompt = `You are an enthusiastic and knowledgeable trivia AI companion. Be warm, educational, and engaging.
Context — the player just read this fun fact: "${factText || ''}".
Player asks: ${message}
Respond clearly and concisely (2-3 paragraphs max).`;

  try {
    const response = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to connect to Gemini API.' });
    }

    const data = await response.json();
    const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received. Try again!';
    res.json({ text: botText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to interact with Gemini.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 NaijaLearn server running on http://localhost:${PORT}`);
  console.log(`🔒 Production API keys are securely managed via server env`);
  console.log(`==================================================`);
});
