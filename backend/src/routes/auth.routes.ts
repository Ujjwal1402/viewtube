import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/profile', (req, res, next) => authController.updateProfile(req, res, next));
router.post('/channels/:channelId/subscribe', (req, res, next) => authController.toggleSubscription(req, res, next));

export default router;
