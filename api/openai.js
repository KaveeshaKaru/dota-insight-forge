import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured on the server.' });
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ error: `OpenAI API request failed: ${response.statusText}`, details: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
} 