import { config } from '../../config';
import { Qr } from '../Qr';

export function GetTheApp() {
  const site = config.siteUrl ?? (typeof window === 'undefined' ? '' : window.location.origin);
  const target = config.apkUrl ?? `${site}/check`;
  return (
    <div className="apk">
      <Qr value={target} label={config.apkUrl ? 'QR code: download the SkinKey Android APK' : 'QR code: open the SkinKey web check'} />
      <p>
        {config.apkUrl ? (
          <>
            Android APK from GitHub Releases. Scan to download, or{' '}
            <a className="text-link" href={config.apkUrl}>
              download the APK
            </a>
            . Android only; install from a file.
          </>
        ) : (
          <>The Android APK link lands here with the first signed release. Until then, this code opens the web check.</>
        )}
      </p>
    </div>
  );
}
