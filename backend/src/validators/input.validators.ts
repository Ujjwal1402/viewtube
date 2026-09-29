export class InputValidators {
  public static isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  public static isValidHandle(handle: string): boolean {
    const clean = handle.startsWith('@') ? handle.slice(1) : handle;
    return /^[a-zA-Z0-9_]{3,30}$/.test(clean);
  }

  public static validateComment(content: string): { isValid: boolean; error?: string } {
    if (!content || !content.trim()) {
      return { isValid: false, error: 'Comment content cannot be empty.' };
    }
    if (content.trim().length > 2000) {
      return { isValid: false, error: 'Comment cannot exceed 2000 characters.' };
    }
    return { isValid: true };
  }

  public static validateVideoUpload(data: { title?: string; videoUrl?: string }): { isValid: boolean; error?: string } {
    if (!data.title || !data.title.trim()) {
      return { isValid: false, error: 'Video title is required.' };
    }
    if (!data.videoUrl || !data.videoUrl.trim()) {
      return { isValid: false, error: 'Video file URL or data is required.' };
    }
    return { isValid: true };
  }
}
