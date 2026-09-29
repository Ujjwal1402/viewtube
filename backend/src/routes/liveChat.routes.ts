import { Router } from 'express';
import { liveChatController } from '../controllers/liveChat.controller';

const router = Router();

router.get('/:videoId/chat', (req, res, next) => liveChatController.getMessages(req, res, next));
router.post('/:videoId/chat', (req, res, next) => liveChatController.sendMessage(req, res, next));

export default router;
