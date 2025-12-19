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
        const resp = await fetch(`${API_BASE}/api/tasks/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'Cookie': cookieHeader
            },
            body: JSON.stringify(req.body)
        });

        const data = await resp.json();
        res.status(resp.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
}
