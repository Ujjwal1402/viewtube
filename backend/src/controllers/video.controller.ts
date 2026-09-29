import { Request, Response, NextFunction } from 'express';
import { videoService } from '../services/video.service';
import { InputValidators } from '../validators/input.validators';

export class VideoController {
  public async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category } = req.query;
      const videos = await videoService.getVideos(
        typeof search === 'string' ? search : undefined,
        typeof category === 'string' ? category : undefined
      );
      res.json({ success: true, count: videos.length, data: videos });
    } catch (err) {
      next(err);
    }
  }

  public async getVideoById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const video = await videoService.getVideoById(id);
      if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }
      res.json({ success: true, data: video });
    } catch (err) {
      next(err);
    }
  }

  public async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recommendations = await videoService.getRecommendations(id);
      res.json({ success: true, count: recommendations.length, data: recommendations });
    } catch (err) {
      next(err);
    }
  }

  public async createVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = InputValidators.validateVideoUpload(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const created = await videoService.createVideo(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  public async recordView(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const newViews = await videoService.recordView(id);
      if (newViews === null) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }
      res.json({ success: true, views: newViews });
    } catch (err) {
      next(err);
    }
  }

  public async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isLike } = req.body;
      const result = await videoService.toggleLike(id, typeof isLike === 'boolean' ? isLike : true);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const success = await videoService.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }
      res.json({ success: true, message: 'Video deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const videoController = new VideoController();
