import { ImageAsset, CustomImageAssignment, FocalPoint } from '../types/images';

const DB_NAME = 'AmbienceIntelligenceStudio_Images_v1';
const DB_VERSION = 1;
const ASSETS_STORE = 'image_assets';
const ASSIGNMENTS_STORE = 'image_assignments';

// In-memory fallback if IndexedDB is blocked in restricted sandboxes
const memoryAssets: Map<string, ImageAsset> = new Map();
const memoryAssignments: Map<string, CustomImageAssignment> = new Map();

class ImageStorageService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private async openDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(ASSETS_STORE)) {
            db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(ASSIGNMENTS_STORE)) {
            db.createObjectStore(ASSIGNMENTS_STORE, { keyPath: 'targetKey' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB unavailable, using memory store fallback');
          resolve(null);
        };
      } catch (err) {
        console.warn('Error opening IndexedDB:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Helper to convert File or Blob to DataURL
   */
  public async fileToDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Helper to get image dimensions
   */
  public async getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = dataUrl;
    });
  }

  /**
   * Save a new uploaded image into the library
   */
  public async saveAsset(file: File | Blob, customName?: string, originalFilename?: string): Promise<ImageAsset> {
    const dataUrl = await this.fileToDataUrl(file);
    const dimensions = await this.getImageDimensions(dataUrl);

    const filename = originalFilename || (file instanceof File ? file.name : 'uploaded_image.png');
    const name = customName || filename.replace(/\.[^/.]+$/, '');
    const mimeType = file.type || 'image/png';
    const size = file.size;

    const asset: ImageAsset = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      filename,
      mimeType,
      size,
      dataUrl,
      width: dimensions.width,
      height: dimensions.height,
      createdAt: Date.now(),
    };

    const db = await this.openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.put(asset);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      memoryAssets.set(asset.id, asset);
    }

    return asset;
  }

  /**
   * Retrieve all saved images from the library
   */
  public async getAllAssets(): Promise<ImageAsset[]> {
    const db = await this.openDB();
    if (db) {
      return new Promise<ImageAsset[]>((resolve) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as ImageAsset[]) || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    }

    return Array.from(memoryAssets.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Retrieve single image asset by ID
   */
  public async getAsset(id: string): Promise<ImageAsset | null> {
    const db = await this.openDB();
    if (db) {
      return new Promise<ImageAsset | null>((resolve) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }

    return memoryAssets.get(id) || null;
  }

  /**
   * Rename an image asset in the library
   */
  public async renameAsset(id: string, newName: string): Promise<void> {
    const asset = await this.getAsset(id);
    if (!asset) return;

    asset.name = newName.trim();

    const db = await this.openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.put(asset);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      memoryAssets.set(id, asset);
    }
  }

  /**
   * Delete image asset from library and clean up orphan assignments
   */
  public async deleteAsset(id: string): Promise<void> {
    const db = await this.openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([ASSETS_STORE, ASSIGNMENTS_STORE], 'readwrite');
        const assetStore = tx.objectStore(ASSETS_STORE);
        const assignStore = tx.objectStore(ASSIGNMENTS_STORE);

        assetStore.delete(id);

        // Also clean up assignments that reference this asset
        const cursorReq = assignStore.openCursor();
        cursorReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            if (cursor.value.assetId === id) {
              cursor.delete();
            }
            cursor.continue();
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } else {
      memoryAssets.delete(id);
      for (const [key, assign] of memoryAssignments.entries()) {
        if (assign.assetId === id) {
          memoryAssignments.delete(key);
        }
      }
    }
  }

  /**
   * Retrieve all card assignments
   */
  public async getAllAssignments(): Promise<Record<string, CustomImageAssignment>> {
    const db = await this.openDB();
    if (db) {
      return new Promise<Record<string, CustomImageAssignment>>((resolve) => {
        const tx = db.transaction(ASSIGNMENTS_STORE, 'readonly');
        const store = tx.objectStore(ASSIGNMENTS_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as CustomImageAssignment[]) || [];
          const map: Record<string, CustomImageAssignment> = {};
          for (const item of list) {
            map[item.targetKey] = item;
          }
          resolve(map);
        };
        req.onerror = () => resolve({});
      });
    }

    const map: Record<string, CustomImageAssignment> = {};
    for (const [key, item] of memoryAssignments.entries()) {
      map[key] = item;
    }
    return map;
  }

  /**
   * Retrieve assignment for a specific target key (e.g. 'world:hogwarts-wizarding')
   */
  public async getAssignment(targetKey: string): Promise<CustomImageAssignment | null> {
    const db = await this.openDB();
    if (db) {
      return new Promise<CustomImageAssignment | null>((resolve) => {
        const tx = db.transaction(ASSIGNMENTS_STORE, 'readonly');
        const store = tx.objectStore(ASSIGNMENTS_STORE);
        const req = store.get(targetKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }

    return memoryAssignments.get(targetKey) || null;
  }

  /**
   * Assign an image asset to a specific target card or view
   */
  public async setAssignment(targetKey: string, assetId: string, focalPoint: FocalPoint = 'center'): Promise<void> {
    const assignment: CustomImageAssignment = {
      targetKey,
      assetId,
      focalPoint,
      assignedAt: Date.now(),
    };

    const db = await this.openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(ASSIGNMENTS_STORE, 'readwrite');
        const store = tx.objectStore(ASSIGNMENTS_STORE);
        const req = store.put(assignment);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      memoryAssignments.set(targetKey, assignment);
    }
  }

  /**
   * Remove assignment (restore card to default artwork)
   */
  public async removeAssignment(targetKey: string): Promise<void> {
    const db = await this.openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(ASSIGNMENTS_STORE, 'readwrite');
        const store = tx.objectStore(ASSIGNMENTS_STORE);
        const req = store.delete(targetKey);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      memoryAssignments.delete(targetKey);
    }
  }

  /**
   * Get all target keys currently using a specific image asset
   */
  public async getAssetUsageKeys(assetId: string): Promise<string[]> {
    const all = await this.getAllAssignments();
    const keys: string[] = [];
    for (const [key, assign] of Object.entries(all)) {
      if (assign.assetId === assetId) {
        keys.push(key);
      }
    }
    return keys;
  }
}

export const ImageStorage = new ImageStorageService();
