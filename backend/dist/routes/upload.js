"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = (0, uuid_1.v4)();
        cb(null, `${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});
router.post('/', auth_1.authenticateToken, upload.single('image'), (req, res) => {
    try {
        console.log('Backend: Upload request received', req.file ? 'File Present' : 'No File');
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return the URL path
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map