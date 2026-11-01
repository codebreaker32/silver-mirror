const IMAGE_EXT = /\.(jpe?g|png|webp|heic)$/i;

export const isImagePath = (path: string) => IMAGE_EXT.test(path.split('?')[0] ?? path);
