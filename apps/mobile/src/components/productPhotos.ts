/**
 * Real per-product pack photos from Open Beauty Facts (CC BY-SA 3.0, Open Beauty Facts contributors), keyed by
 * catalogue id. Generated from apps/mobile/assets/images/products/credits-*.json; credits also in docs/CREDITS.md.
 * Static requires only: Metro resolves each asset at bundle time.
 */

/** Metro asset ids: valid for both react-native Image and expo-image. */
export const PRODUCT_PHOTOS: Readonly<Record<string, number>> = {
  'cerave-cerave-blemish-control-cleanser-with-2-salicylic-acid': require('../../assets/images/products/cerave-cerave-blemish-control-cleanser-with-2-salicylic-acid.jpg'),
  'cerave-cerave-foaming-facial-cleanser-for-normal-to-oily-skin': require('../../assets/images/products/cerave-cerave-foaming-facial-cleanser-for-normal-to-oily-skin.jpg'),
  'cerave-cerave-moisturising-cream-for-dry-skin': require('../../assets/images/products/cerave-cerave-moisturising-cream-for-dry-skin.jpg'),
  'cetaphil-cetaphil-moisturising-lotion': require('../../assets/images/products/cetaphil-cetaphil-moisturising-lotion.jpg'),
  'cetaphil-oily-skin-cleanser': require('../../assets/images/products/cetaphil-oily-skin-cleanser.jpg'),
  'dot-key-watermelon-sunscreen-spf-50-pa-with-new-age-uv-filters-for-oily-skin': require('../../assets/images/products/dot-key-watermelon-sunscreen-spf-50-pa-with-new-age-uv-filters-for-oily-skin.jpg'),
  'la-roche-posay-cicaplast-baume-b5': require('../../assets/images/products/la-roche-posay-cicaplast-baume-b5.jpg'),
  'nivea-nivea-derma-skin-clear-wash-gel': require('../../assets/images/products/nivea-nivea-derma-skin-clear-wash-gel.jpg'),
  'nivea-nivea-soft': require('../../assets/images/products/nivea-nivea-soft.jpg'),
  'nivea-nivea-soft-daily-uv-spf-15-light-moisturising-cream': require('../../assets/images/products/nivea-nivea-soft-daily-uv-spf-15-light-moisturising-cream.jpg'),
  'sebamed-liquid-face-body-wash': require('../../assets/images/products/sebamed-liquid-face-body-wash.jpg'),
  'sebamed-moisturizing-cream': require('../../assets/images/products/sebamed-moisturizing-cream.jpg'),
  'simple-simple-hydrating-light-moisturiser-50ml': require('../../assets/images/products/simple-simple-hydrating-light-moisturiser-50ml.jpg'),
  'simple-simple-kind-to-skin-refreshing-facial-wash-250ml': require('../../assets/images/products/simple-simple-kind-to-skin-refreshing-facial-wash-250ml.jpg'),
};

/** Brand + name as the screen reader says it: "Photo of <title>". */
export const PRODUCT_PHOTO_TITLES: Readonly<Record<string, string>> = {
  'cerave-cerave-blemish-control-cleanser-with-2-salicylic-acid': 'CeraVe Blemish Control Cleanser with 2% Salicylic Acid',
  'cerave-cerave-foaming-facial-cleanser-for-normal-to-oily-skin': 'CeraVe Foaming Facial Cleanser For Normal to Oily Skin',
  'cerave-cerave-moisturising-cream-for-dry-skin': 'CeraVe Moisturising Cream for Dry Skin',
  'cetaphil-cetaphil-moisturising-lotion': 'Cetaphil Moisturising Lotion',
  'cetaphil-oily-skin-cleanser': 'Cetaphil Oily Skin Cleanser',
  'dot-key-watermelon-sunscreen-spf-50-pa-with-new-age-uv-filters-for-oily-skin': 'Dot & Key Watermelon Sunscreen SPF 50+ PA++++ With New-Age UV Filters For Oily Skin',
  'la-roche-posay-cicaplast-baume-b5': 'La Roche-Posay CICAPLAST BAUME B5+',
  'nivea-nivea-derma-skin-clear-wash-gel': 'NIVEA Derma Skin Clear Wash Gel',
  'nivea-nivea-soft': 'NIVEA Soft',
  'nivea-nivea-soft-daily-uv-spf-15-light-moisturising-cream': 'NIVEA Soft Daily UV SPF-15 Light Moisturising Cream',
  'sebamed-liquid-face-body-wash': 'Sebamed Liquid Face & Body Wash',
  'sebamed-moisturizing-cream': 'Sebamed Moisturizing Cream',
  'simple-simple-hydrating-light-moisturiser-50ml': 'Simple Hydrating Light Moisturiser, 50ml',
  'simple-simple-kind-to-skin-refreshing-facial-wash-250ml': 'Simple Kind to Skin Refreshing Facial Wash, 250ml',
};

export interface ProductPhotoCredit {
  id: string;
  file: string;
  obfCode: string;
  obfUrl: string;
  licence: string;
  author: string;
}

export const PRODUCT_PHOTO_LICENCE = 'CC BY-SA 3.0';
export const PRODUCT_PHOTO_CREDITS: readonly ProductPhotoCredit[] = [
  {
    id: 'cerave-cerave-blemish-control-cleanser-with-2-salicylic-acid',
    file: 'cerave-cerave-blemish-control-cleanser-with-2-salicylic-acid.jpg',
    obfCode: '3337875784054',
    obfUrl: 'https://world.openbeautyfacts.org/product/3337875784054',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'cerave-cerave-foaming-facial-cleanser-for-normal-to-oily-skin',
    file: 'cerave-cerave-foaming-facial-cleanser-for-normal-to-oily-skin.jpg',
    obfCode: '0751672010520',
    obfUrl: 'https://world.openbeautyfacts.org/product/0751672010520',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'cerave-cerave-moisturising-cream-for-dry-skin',
    file: 'cerave-cerave-moisturising-cream-for-dry-skin.jpg',
    obfCode: '3337875598996',
    obfUrl: 'https://world.openbeautyfacts.org/product/3337875598996',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'cetaphil-cetaphil-moisturising-lotion',
    file: 'cetaphil-cetaphil-moisturising-lotion.jpg',
    obfCode: '3499320004558',
    obfUrl: 'https://world.openbeautyfacts.org/product/3499320004558',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'cetaphil-oily-skin-cleanser',
    file: 'cetaphil-oily-skin-cleanser.jpg',
    obfCode: '0772618072006',
    obfUrl: 'https://world.openbeautyfacts.org/product/0772618072006',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'dot-key-watermelon-sunscreen-spf-50-pa-with-new-age-uv-filters-for-oily-skin',
    file: 'dot-key-watermelon-sunscreen-spf-50-pa-with-new-age-uv-filters-for-oily-skin.jpg',
    obfCode: '8906147702383',
    obfUrl: 'https://world.openbeautyfacts.org/product/8906147702383',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'la-roche-posay-cicaplast-baume-b5',
    file: 'la-roche-posay-cicaplast-baume-b5.jpg',
    obfCode: '3337875816847',
    obfUrl: 'https://world.openbeautyfacts.org/product/3337875816847',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'nivea-nivea-derma-skin-clear-wash-gel',
    file: 'nivea-nivea-derma-skin-clear-wash-gel.jpg',
    obfCode: '4005900977953',
    obfUrl: 'https://world.openbeautyfacts.org/product/4005900977953/nivea-derma-skin-clear-reinigingsgel',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'nivea-nivea-soft',
    file: 'nivea-nivea-soft.jpg',
    obfCode: '5025970022574',
    obfUrl: 'https://world.openbeautyfacts.org/product/5025970022574/nivea-soft-moisturising-cream',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'nivea-nivea-soft-daily-uv-spf-15-light-moisturising-cream',
    file: 'nivea-nivea-soft-daily-uv-spf-15-light-moisturising-cream.jpg',
    obfCode: '4006000155913',
    obfUrl: 'https://world.openbeautyfacts.org/product/4006000155913/nivea-soft-daily-uv-spf15-creme',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'sebamed-liquid-face-body-wash',
    file: 'sebamed-liquid-face-body-wash.jpg',
    obfCode: '4103040901095',
    obfUrl: 'https://world.openbeautyfacts.org/product/4103040901095/sebamed-zeepvrije-wasemulsie',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'sebamed-moisturizing-cream',
    file: 'sebamed-moisturizing-cream.jpg',
    obfCode: '4103040113412',
    obfUrl: 'https://world.openbeautyfacts.org/product/4103040113412/sebamed-sensitive-skin-hydraterende-gezichtscreme',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'simple-simple-hydrating-light-moisturiser-50ml',
    file: 'simple-simple-hydrating-light-moisturiser-50ml.jpg',
    obfCode: '50052790',
    obfUrl: 'https://world.openbeautyfacts.org/product/50052790',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
  {
    id: 'simple-simple-kind-to-skin-refreshing-facial-wash-250ml',
    file: 'simple-simple-kind-to-skin-refreshing-facial-wash-250ml.jpg',
    obfCode: '50052806',
    obfUrl: 'https://world.openbeautyfacts.org/product/50052806',
    licence: 'CC BY-SA 3.0',
    author: 'Open Beauty Facts contributors',
  },
];

/** The pack photo for a catalogue id, if Open Beauty Facts has one. */
export function productPhoto(productId: string | null | undefined): number | undefined {
  return productId ? PRODUCT_PHOTOS[productId] : undefined;
}
