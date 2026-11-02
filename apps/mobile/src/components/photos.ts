import type { ImageSourcePropType } from 'react-native';

/**
 * Licensed stock photos (Unsplash License, see docs/CREDITS.md). They are illustrative: a product photo stands for the
 * category, never for the exact product, so every use says so (accessibility label, and a caption on the product hero).
 */
export type PhotoKey = 'serum' | 'moisturiser' | 'cleanser' | 'sunscreen' | 'tinted_spf' | 'portrait' | 'texture';

export const PHOTOS: Record<PhotoKey, ImageSourcePropType> = {
  serum: require('../../assets/images/photos/serum.jpg'),
  moisturiser: require('../../assets/images/photos/moisturiser.jpg'),
  cleanser: require('../../assets/images/photos/cleanser.jpg'),
  sunscreen: require('../../assets/images/photos/sunscreen.jpg'),
  tinted_spf: require('../../assets/images/photos/tinted_spf.jpg'),
  portrait: require('../../assets/images/photos/portrait.jpg'),
  texture: require('../../assets/images/photos/texture.jpg'),
};

/** What each product photo shows, for "Photo of … (illustrative)". */
export const PHOTO_SUBJECT: Record<'serum' | 'moisturiser' | 'cleanser' | 'sunscreen' | 'tinted_spf', string> = {
  serum: 'a serum bottle',
  moisturiser: 'a moisturiser jar',
  cleanser: 'a cleanser pump bottle',
  sunscreen: 'sunscreen tubes',
  tinted_spf: 'tinted sunscreen swatches',
};

export interface PhotoCredit {
  file: string;
  shows: string;
  photographer: string;
  source: string;
}

/** Static copy of the table in docs/CREDITS.md. All under the Unsplash License. */
export const PHOTO_LICENCE = 'Unsplash License';
export const PHOTO_CREDITS: readonly PhotoCredit[] = [
  { file: 'serum.jpg', shows: 'White dropper bottle on marble', photographer: 'Content Pixie', source: 'https://unsplash.com/photos/WdJ4WnLxyDs' },
  { file: 'moisturiser.jpg', shows: 'Frosted glass cream jar and plain box', photographer: 'Avtar Singh', source: 'https://unsplash.com/photos/w-IvqlYGYAU' },
  { file: 'cleanser.jpg', shows: 'White pump bottle on linen', photographer: 'Sincerely Media', source: 'https://unsplash.com/photos/LtGwgq7r_mc' },
  { file: 'sunscreen.jpg', shows: 'Blank white tubes on a stone-beige block', photographer: 'Point Normal', source: 'https://unsplash.com/photos/Xp0bTCLD07k' },
  { file: 'tinted_spf.jpg', shows: 'Skin-tone cream swatches', photographer: 'Kate Glotova', source: 'https://unsplash.com/photos/OO86yQ0T3UU' },
  { file: 'portrait.jpg', shows: 'Black-and-white portrait, eyes closed', photographer: 'Fanny Gustafsson', source: 'https://unsplash.com/photos/G0oxf0bjrB8' },
  { file: 'texture.jpg', shows: 'Smear of white cream', photographer: 'Jocelyn Morales', source: 'https://unsplash.com/photos/JiqTLjzEH18' },
];
