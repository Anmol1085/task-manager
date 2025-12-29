import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;
  const token = req.headers.authorization || '';

  // Forward incoming cookies so backend can read HttpOnly cookies
  const cookieHeader = req.headers.cookie || '';

  try {
    const resp = await fetch(`${API_BASE}/api/tasks${req.query.id ? `/${req.query.id}` : ''}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Cookie': cookieHeader
      },
      body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body)
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Proxy error' });
  }
}