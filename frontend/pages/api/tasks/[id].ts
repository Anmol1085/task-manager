import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;
    const { id } = query;
    const token = req.headers.authorization || '';
    const cookieHeader = req.headers.cookie || '';

    try {
        const resp = await fetch(`${API_BASE}/api/tasks/${id}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'Cookie': cookieHeader
            },
            body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body)
        });

        // If backend returns 204 No Content, we can't parse JSON
        if (resp.status === 204) {
            return res.status(204).end();
        }

        // Backend likely returns 404 or others as JSON too
        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            return res.status(resp.status).json(data);
        }

        res.status(resp.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error' });
    }
}
