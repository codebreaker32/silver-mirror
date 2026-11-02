import { COPY } from '@skinkey/contracts';
import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { BrandLockup } from '../components/brand/Brand';
import { CREDITS } from '../content/credits';

const NAV = [
  { to: '/check', label: 'Check' },
  { to: '/audit', label: 'Audit' },
  { to: '/rules', label: 'Rules' },
  { to: '/how', label: 'How it works' },
];

export function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="sk-header">
        <Link to="/" className="brand-link" aria-label={`${COPY.appName} home`}>
          <BrandLockup />
        </Link>
        <nav className="sk-nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <details className="sk-menu">
          <summary>Menu</summary>
          <div className="sk-menu-panel">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}>
                {n.label}
              </Link>
            ))}
          </div>
        </details>
        <Link to="/check?sample=1" className="btn btn-secondary btn-sm header-cta">
          Try a sample share
        </Link>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="sk-footer">
        <div className="footer-line">
          <p>{COPY.appName} checks a listing against its own ingredient list and your YouCam readings.</p>
          <ul className="footer-links">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
            <li>
              <a href="#main">Back to top</a>
            </li>
          </ul>
          <p className="footer-legal">
            {COPY.footer} {COPY.notAffiliated}
          </p>
        </div>
        <ul className="footer-credits">
          <li>Skin readings, skin tone and try-on: YouCam API by Perfect Corp.</li>
          <li>Label and title reading: Claude by Anthropic. Verdicts come from published rules only.</li>
          <li>Type: Noto Serif Display and Geist (SIL Open Font License).</li>
          {CREDITS.map((c) => (
            <li key={c.file}>
              Plate: <a href={c.page}>{c.title}</a>, {c.creator}, {c.date}. {c.license}, via {c.via}.
            </li>
          ))}
          <li>Built for the YouCam API Skin AI &amp; eCommerce VTO Hackathon, November 2026.</li>
        </ul>
      </footer>
    </>
  );
}
