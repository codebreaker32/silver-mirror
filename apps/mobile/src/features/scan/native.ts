import { Directory, File, Paths, UploadType } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { UploadSlot } from '@skinkey/contracts';
import { isImagePath } from './imageFiles';
import { MAX_LONG_SIDE, needsDownscale } from './pictureSize';
import type { Capture } from './runScan';

export async function uploadToSlot(uri: string, slot: UploadSlot): Promise<void> {
  const res = await new File(uri).upload(slot.url, {
    httpMethod: slot.method,
    headers: slot.headers,
    uploadType: UploadType.BINARY_CONTENT,
    mimeType: 'image/jpeg',
  });
  if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed (${res.status})`);
}

export function deleteLocal(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // already gone
  }
}

export function fileSize(uri: string): number {
  return new File(uri).size ?? 0;
}

export async function prepareScanCapture(photo: { uri: string; width: number; height: number }): Promise<Capture> {
  if (!needsDownscale(photo.width, photo.height)) {
    return { ...photo, fileSize: fileSize(photo.uri) };
  }
  const landscape = photo.width >= photo.height;
  const ref = await ImageManipulator.manipulate(photo.uri)
    .resize(landscape ? { width: MAX_LONG_SIDE } : { height: MAX_LONG_SIDE })
    .renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  deleteLocal(photo.uri);
  return { uri: out.uri, width: out.width, height: out.height, fileSize: fileSize(out.uri) };
}

function walk(dir: Directory, found: string[], depth: number): void {
  if (depth > 6 || !dir.exists) return;
  for (const entry of dir.list()) {
    if (entry instanceof Directory) walk(entry, found, depth + 1);
    else if (isImagePath(entry.uri)) found.push(entry.uri);
  }
}

/** Cache-directory check: lists any image files left in the app's cache or document folders. */
export function findStoredImages(): string[] {
  const found: string[] = [];
  for (const get of [() => Paths.cache, () => Paths.document]) {
    try {
      walk(get(), found, 0);
    } catch {
      // unreadable folder (or no app folders at all, as on web)
    }
  }
  return found;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
