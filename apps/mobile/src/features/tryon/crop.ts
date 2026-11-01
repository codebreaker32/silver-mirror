export const TRYON_WIDTH = 768;
export const TRYON_HEIGHT = 1024;

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/** Centre crop to 3:4 portrait so the resize to 768×1024 keeps proportions. */
export function centerCrop3x4(width: number, height: number): CropRect {
  const target = TRYON_WIDTH / TRYON_HEIGHT;
  if (width / height > target) {
    const w = Math.round(height * target);
    return { originX: Math.floor((width - w) / 2), originY: 0, width: w, height };
  }
  const h = Math.round(width / target);
  return { originX: 0, originY: Math.floor((height - h) / 2), width, height: h };
}
