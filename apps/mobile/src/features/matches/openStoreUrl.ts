import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { opensInCustomTab } from './links';

/** Opens a store link: Nykaa in a browser Custom Tab (FINDINGS S1), everything else via the OS (store app if installed). */
export const openStoreUrl = async (url: string): Promise<void> => {
  if (opensInCustomTab(url)) {
    await WebBrowser.openBrowserAsync(url, { showTitle: true, enableBarCollapsing: true });
    return;
  }
  await Linking.openURL(url);
};
