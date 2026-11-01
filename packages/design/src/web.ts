import tokens from '../../../design/system/tokens/skinkey.tokens.json';

export { tokens };
export const webFontStacks = {
  serif: tokens.typography.family.serif.web,
  sans: tokens.typography.family.sans.web,
} as const;
