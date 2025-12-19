import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

router.post('/', authenticateToken, upload.single('image'), (req: any, res) => {
    try {
        console.log('Backend: Upload request received', req.file ? 'File Present' : 'No File');
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return the URL path
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
