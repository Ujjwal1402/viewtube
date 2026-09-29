import { Router } from 'express';
import { videoController } from '../controllers/video.controller';

const router = Router();

router.get('/', (req, res, next) => videoController.getVideos(req, res, next));
router.get('/:id', (req, res, next) => videoController.getVideoById(req, res, next));
router.get('/:id/recommendations', (req, res, next) => videoController.getRecommendations(req, res, next));
router.post('/', (req, res, next) => videoController.createVideo(req, res, next));
router.post('/:id/view', (req, res, next) => videoController.recordView(req, res, next));
router.post('/:id/like', (req, res, next) => videoController.toggleLike(req, res, next));
router.delete('/:id', (req, res, next) => videoController.deleteVideo(req, res, next));

export default router;
