import { Image } from 'react-native';
import { CameraView } from 'expo-camera';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export function deleteQuietly(uri: string | null | undefined) {
  if (!uri || !uri.startsWith('file:')) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Already gone or not ours to delete.
  }
}

export const imageSize = (uri: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => Image.getSize(uri, (width, height) => resolve({ width, height }), reject));

/** Crop and downscale to a JPEG held only as base64. The rendered temp file is deleted straight away. */
export async function encodeJpeg(uri: string, opts: { crop?: CropRect; maxWidth: number }): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  if (opts.crop) ctx.crop(opts.crop);
  const width = opts.crop ? opts.crop.width : (await imageSize(uri)).width;
  if (width > opts.maxWidth) ctx.resize({ width: opts.maxWidth });
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
  deleteQuietly(out.uri);
  if (!out.base64) throw new Error('encode failed');
  return out.base64;
}

/**
 * Ingredient-label photo through the ML Kit document scanner (edge detection and crop built in).
 * Returns null if the user backs out. The scanner's page files are deleted after encoding.
 */
export async function scanLabel(): Promise<string | null> {
  const res = await CameraView.scanDocumentAsync();
  const page = res?.pages[0];
  if (!res || !page) return null;
  try {
    return await encodeJpeg(page, { maxWidth: 1600 });
  } finally {
    res.pages.forEach(deleteQuietly);
  }
}

export const documentScannerAvailable = () => CameraView.isDocumentScannerAvailable;
