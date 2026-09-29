import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { InputValidators } from '../validators/input.validators';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailOrHandle } = req.body;
      if (!emailOrHandle || !emailOrHandle.trim()) {
        return res.status(400).json({ success: false, error: 'Email or handle is required' });
      }

      const user = await authService.login(emailOrHandle);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: user,
        token: `mock_jwt_token_${user.id}_${Date.now()}`,
      });
    } catch (err) {
      next(err);
    }
  }

  public async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, handle } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Full name is required' });
      }
      if (!email || !InputValidators.isValidEmail(email)) {
        return res.status(400).json({ success: false, error: 'Valid email address is required' });
      }
      if (!handle || !InputValidators.isValidHandle(handle)) {
        return res.status(400).json({
          success: false,
          error: 'Handle must be 3-30 characters containing letters, numbers, or underscores',
        });
      }

      const user = await authService.signup(name, email, handle);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: user,
        token: `mock_jwt_token_${user.id}_${Date.now()}`,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, ...updates } = req.body;
      const targetId = userId || 'user-current';
      const updated = await authService.updateProfile(targetId, updates);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  public async toggleSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { channelId } = req.params;
      const { userId } = req.body;
      const targetUserId = userId || 'user-current';

      const result = await authService.toggleSubscription(targetUserId, channelId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
