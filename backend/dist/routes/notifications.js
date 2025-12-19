"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationService_1 = require("../services/notificationService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const notifications = await (0, notificationService_1.getNotificationsForUser)(req.user.id);
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
router.post('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await (0, notificationService_1.markNotificationRead)(id);
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to mark notification' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map