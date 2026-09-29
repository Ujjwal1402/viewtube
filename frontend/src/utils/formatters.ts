export function formatViews(views: number): string {
  if (views >= 1_000_000_000) {
    return (views / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (views >= 1_000) {
    return (views / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return views.toLocaleString();
}

export function formatDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
    return '00:00';
  }
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimestampToSeconds(text: string): number | null {
  const parts = text.split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}
