import { Video } from '../types';

const DB_NAME = 'viewtube_db';
const DB_VERSION = 1;
const STORE_NAME = 'user_videos';

interface StoredVideoRecord {
  id: string;
  videoBlob: Blob;
  thumbnailDataUrl: string;
  meta: Omit<Video, 'videoUrl' | 'thumbnailUrl'>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Map of active Object URLs to revoke when needed
const activeUrls = new Map<string, string>();

export async function saveUserVideoToDB(
  id: string,
  videoBlob: Blob,
  thumbnailDataUrl: string,
  meta: Omit<Video, 'id' | 'videoUrl' | 'thumbnailUrl'>
): Promise<Video> {
  const db = await openDB();
  const record: StoredVideoRecord = {
    id,
    videoBlob,
    thumbnailDataUrl,
    meta: { ...meta, id },
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const blobUrl = URL.createObjectURL(videoBlob);
  activeUrls.set(id, blobUrl);

  return {
    ...meta,
    id,
    videoUrl: blobUrl,
    thumbnailUrl: thumbnailDataUrl,
    isUserUpload: true,
    isBlob: true,
  };
}

export async function loadUserVideosFromDB(): Promise<Video[]> {
  try {
    const db = await openDB();
    const records = await new Promise<StoredVideoRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    return records.map((rec) => {
      let blobUrl = activeUrls.get(rec.id);
      if (!blobUrl) {
        blobUrl = URL.createObjectURL(rec.videoBlob);
        activeUrls.set(rec.id, blobUrl);
      }
      return {
        ...rec.meta,
        id: rec.id,
        videoUrl: blobUrl,
        thumbnailUrl: rec.thumbnailDataUrl,
        isUserUpload: true,
        isBlob: true,
      };
    });
  } catch (err) {
    console.warn('Failed to load user videos from IndexedDB', err);
    return [];
  }
}

export async function deleteUserVideoFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    const url = activeUrls.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      activeUrls.delete(id);
    }
  } catch (err) {
    console.warn('Failed to delete video from IndexedDB', err);
  }
}
