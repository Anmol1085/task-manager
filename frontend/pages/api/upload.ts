
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false, // Disallow Next.js body parsing
    },
};

// Use localhost for server-side proxying to ensure connectivity
const API_BASE = 'http://127.0.0.1:5001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        console.log('Proxy: Starting upload request processing...');
        const form = new IncomingForm();

        const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        console.log('Proxy: Form parsed.');

        if (!files.image) {
            console.error('Proxy: No image file found in request');
            return res.status(400).json({ error: 'No file provided' });
        }

        const formData = new FormData();
        const file = Array.isArray(files.image) ? files.image[0] : files.image;

        console.log(`Proxy: Processing file ${file.originalFilename} (${file.size} bytes)`);

        const fileBuffer = fs.readFileSync(file.filepath);
        formData.append('image', fileBuffer, {
            filename: file.originalFilename || 'upload.jpg',
            contentType: file.mimetype || 'image/jpeg',
        });

        // Convert the FormData stream to a Buffer
        const payloadBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            formData.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            formData.on('end', () => resolve(Buffer.concat(chunks)));
            formData.on('error', (err) => reject(err));
            formData.resume(); // Start the stream
        });

        console.log('Proxy: Payload buffer created, size:', payloadBuffer.length);

        const backendRes = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: payloadBuffer as any,
            headers: {
                ...formData.getHeaders(),
                'Content-Length': payloadBuffer.length.toString(),
                Cookie: req.headers.cookie || '',
            },
        });

        console.log('Proxy: Backend response status:', backendRes.status);

        if (!backendRes.ok) {
            const errorText = await backendRes.text();
            console.error('Proxy: Backend error:', errorText);
            return res.status(backendRes.status).json({ error: `Backend failed: ${backendRes.statusText}` });
        }

        const data = await backendRes.json();
        console.log('Proxy: Upload successful', data);
        res.status(200).json(data);

    } catch (error: any) {
        console.error('Upload proxy error:', error);
        res.status(500).json({ error: `Proxy upload failed: ${error.message}` });
    }
}
