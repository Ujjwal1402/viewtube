import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';

const router = Router();

router.get('/videos/:videoId/comments', (req, res, next) => commentController.getComments(req, res, next));
router.post('/videos/:videoId/comments', (req, res, next) => commentController.addComment(req, res, next));
router.post('/videos/:videoId/comments/:commentId/like', (req, res, next) => commentController.toggleLike(req, res, next));

export default router;
