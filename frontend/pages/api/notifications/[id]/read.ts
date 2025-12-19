import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const token = req.headers.authorization || '';
    const cookieHeader = req.headers.cookie || '';

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const resp = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'Cookie': cookieHeader
            }
        });

        const data = await resp.json();

        if (!resp.ok) {
            return res.status(resp.status).json(data);
        }

        res.status(resp.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error' });
    }
}
