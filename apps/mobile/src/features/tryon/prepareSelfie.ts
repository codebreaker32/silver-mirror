import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { deleteLocal, fileSize } from '../scan/native';
import { centerCrop3x4, TRYON_HEIGHT, TRYON_WIDTH } from './crop';

/** Centre-crops to 3:4 and resizes to 768×1024 on the phone, then deletes the original capture. */
export async function prepareSelfie(photo: { uri: string; width: number; height: number }): Promise<{ uri: string; fileSize: number }> {
  try {
    const ref = await ImageManipulator.manipulate(photo.uri)
      .crop(centerCrop3x4(photo.width, photo.height))
      .resize({ width: TRYON_WIDTH, height: TRYON_HEIGHT })
      .renderAsync();
    const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    if (out.width !== TRYON_WIDTH || out.height !== TRYON_HEIGHT) {
      deleteLocal(out.uri);
      throw new Error(`Resize gave ${out.width}×${out.height}`);
    }
    return { uri: out.uri, fileSize: fileSize(out.uri) };
  } finally {
    deleteLocal(photo.uri);
  }
}
