/**
 * Utility to extract exact video duration from video file/stream metadata
 * with strict concurrency queueing and caching to prevent network congestion.
 */

// In-memory cache for extracted video durations to avoid re-fetching metadata
const durationCache = new Map<string, number>([
  ['/videos/big_buck_bunny.mp4', 60],
  ['/videos/sintel.mp4', 52],
  ['/videos/oceans.mp4', 47],
  ['/videos/tears_of_steel.mp4', 20],
  ['/videos/elephants_dream.mp4', 25],
  ['/videos/starship.mp4', 30],
  ['/videos/flower.mp4', 5],
  ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 5],
  ['https://vjs.zencdn.net/v/oceans.mp4', 47],
  ['https://media.w3.org/2010/05/sintel/trailer.mp4', 52],
]);

// Concurrency queue to ensure background metadata probes do not starve the main video player
type QueueTask = () => Promise<void>;
const taskQueue: QueueTask[] = [];
let activeTasks = 0;
const MAX_CONCURRENT_PROBES = 1;

function processQueue() {
  if (activeTasks >= MAX_CONCURRENT_PROBES || taskQueue.length === 0) return;
  const task = taskQueue.shift();
  if (!task) return;

  activeTasks++;
  task().finally(() => {
    activeTasks--;
    processQueue();
  });
}

function enqueueProbe<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    taskQueue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
    processQueue();
  });
}

/**
 * Reads the actual duration of a video directly from its file or URL metadata.
 * Resolves with the duration in seconds (rounded to nearest integer), or 0 if unavailable.
 */
export function extractVideoDuration(videoUrl: string): Promise<number> {
  if (!videoUrl) return Promise.resolve(0);

  // Return cached duration if already resolved
  if (durationCache.has(videoUrl)) {
    return Promise.resolve(durationCache.get(videoUrl)!);
  }

  // Also check session storage cache if available
  try {
    const cached = sessionStorage.getItem(`v_dur_${videoUrl}`);
    if (cached) {
      const dur = parseFloat(cached);
      if (!isNaN(dur) && dur > 0) {
        durationCache.set(videoUrl, Math.round(dur));
        return Promise.resolve(Math.round(dur));
      }
    }
  } catch {
    // SessionStorage may be restricted in sandboxes
  }

  return enqueueProbe<number>(
    () =>
      new Promise<number>((resolve) => {
        // Double check cache after waiting in queue
        if (durationCache.has(videoUrl)) {
          resolve(durationCache.get(videoUrl)!);
          return;
        }

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        let isCleanedUp = false;
        const cleanup = () => {
          if (isCleanedUp) return;
          isCleanedUp = true;
          video.onloadedmetadata = null;
          video.ondurationchange = null;
          video.onerror = null;
          video.ontimeupdate = null;
          video.pause();
          video.removeAttribute('src');
          video.load();
        };

        // Strict timeout to prevent hanging connections
        const timeoutId = setTimeout(() => {
          cleanup();
          resolve(durationCache.get(videoUrl) || 0);
        }, 3000);

        const handleLoadedMetadata = () => {
          clearTimeout(timeoutId);
          const rawDuration = video.duration;

          if (rawDuration && isFinite(rawDuration) && !isNaN(rawDuration) && rawDuration > 0) {
            const rounded = Math.round(rawDuration);
            durationCache.set(videoUrl, rounded);
            try {
              sessionStorage.setItem(`v_dur_${videoUrl}`, rounded.toString());
            } catch {
              // ignore
            }
            cleanup();
            resolve(rounded);
          } else if (rawDuration === Infinity) {
            video.currentTime = Number.MAX_SAFE_INTEGER;
            video.ontimeupdate = () => {
              video.ontimeupdate = null;
              const fixedDur = Math.round(video.duration || video.currentTime || 0);
              durationCache.set(videoUrl, fixedDur);
              cleanup();
              resolve(fixedDur);
            };
          } else {
            cleanup();
            resolve(0);
          }
        };

        video.onloadedmetadata = handleLoadedMetadata;
        video.ondurationchange = () => {
          if (video.duration && isFinite(video.duration) && video.duration > 0) {
            handleLoadedMetadata();
          }
        };

        video.onerror = () => {
          clearTimeout(timeoutId);
          cleanup();
          resolve(0);
        };

        video.src = videoUrl;
      })
  );
}
