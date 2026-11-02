import Constants from 'expo-constants';
import type { AffiliateParams } from './links';

/** Affiliate params from app.json expo.extra.affiliate; all empty by default (no tags, no disclosure line). */
export const AFFILIATE: AffiliateParams = (Constants.expoConfig?.extra?.affiliate as AffiliateParams | undefined) ?? {};
