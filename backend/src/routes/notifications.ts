import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { getNotificationsForUser, markNotificationRead } from '../services/notificationService';

const router = express.Router();

router.get('/', async (req: AuthRequest, res) => {
  const start = Date.now();
  console.log(`[Notifications] fetching notifications for user ${req.user.id}`);
  try {
    const notifications = await getNotificationsForUser(req.user.id);
    console.log(`[Notifications] fetched ${notifications.length} notifications in ${Date.now() - start}ms`);
    res.json(notifications);
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/:id/read', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updated = await markNotificationRead(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

export default router;
