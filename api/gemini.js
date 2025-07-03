import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI API key not configured on the server.' });
  }

  let prompt;
  try {
    // Vercel's dev server sometimes parses JSON automatically, sometimes not
    prompt = req.body.prompt || (typeof req.body === 'string' ? JSON.parse(req.body).prompt : undefined);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 1, // Controls creativity. Higher is more creative.
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI API Error:', errorData);
      return res.status(response.status).json({ error: `AI API request failed: ${response.statusText}`, details: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
} 