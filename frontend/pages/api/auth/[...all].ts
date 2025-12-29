import { NextApiRequest, NextApiResponse } from 'next';

// Use localhost for server-side proxying to ensure connectivity, fallback to env var
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const cookieHeader = req.headers.cookie || '';
  const path = req.query.all ? `/${(req.query.all as string[]).join('/')}` : '';

  try {
    const resp = await fetch(`${API_BASE}/api/auth${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Authorization': req.headers.authorization || ''
      },
      body: (method === 'GET' || method === 'DELETE' || !req.body) ? undefined : JSON.stringify(req.body)
    });

    // Forward Set-Cookie header
    const setCookie = resp.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (error) {
    console.error('Proxy to backend failed:', error);
    res.status(500).json({ error: 'Proxy error' });
  }
}
