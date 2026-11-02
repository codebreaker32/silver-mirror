import { COPY } from '@skinkey/contracts';
import { Link } from 'react-router';
import { config } from '../../config';
import { SilverMark } from '../brand/Brand';
import { Icon } from '../Icon';
import { Qr } from '../Qr';

/**
 * The close: the app's first step already open. The APK card is the page's last action; until VITE_APK_URL names the
 * GitHub release, the button and the QR point at the release build's output path and the card says so.
 */
export function GetTheApp() {
  const site = config.siteUrl ?? (typeof window === 'undefined' ? '' : window.location.origin);
  const href = config.apkUrl ?? config.apkPlaceholder;
  const qrTarget = /^https?:\/\//.test(href) ? href : `${site}${href}`;
  return (
    <section className="get" id="get" aria-labelledby="get-title">
      <div className="wrap get-grid">
        <div className="get-copy" data-reveal>
          <h2 id="get-title">Check before you buy.</h2>
          <p>
            Install the Android app, scan once (about a minute), then share any listing from Flipkart, Amazon or Nykaa. No
            phone to hand? The web check replays a sample share with the labelled {COPY.reading.demo}. No scan, no sign-up.
          </p>
          <Link className="text-link get-link" to="/check?sample=1">
            Try a sample share on the web
          </Link>
        </div>
        <div className="apk-card" data-ui data-reveal>
          <div className="apk-head">
            <SilverMark size={56} />
            <div>
              <p className="apk-title">{COPY.appName} for Android</p>
              <p className="ui-caption">APK from GitHub Releases · Android only, install from a file</p>
            </div>
          </div>
          <div className="apk-body">
            <Qr value={qrTarget} label={`QR code: download the ${COPY.appName} Android APK`} />
            <ul className="apk-facts">
              <li>
                <Icon name="face-frame" />
                One scan; the photo is deleted from YouCam right after
              </li>
              <li>
                <Icon name="phone-lock" />
                Only bands kept, on your phone
              </li>
              <li>
                <Icon name="share" />
                Works from the store app's Share menu
              </li>
            </ul>
          </div>
          <a className="btn btn-primary btn-block" href={href} download={config.apkUrl ? undefined : 'silver-mirror-release.apk'}>
            <Icon name="download" />
            Download the APK
          </a>
          {!config.apkUrl && <p className="ui-caption">Release link pending: the GitHub release URL replaces this build path.</p>}
          <p className="ui-caption">{COPY.notAffiliated}</p>
        </div>
      </div>
    </section>
  );
}
