import { COPY } from '@skinkey/contracts';
import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useChapterTone } from '../components/hooks';
import { CREDITS } from '../content/credits';

const NAV = [
  { to: '/check', label: 'Check' },
  { to: '/audit', label: 'Audit' },
  { to: '/rules', label: 'Rules' },
  { to: '/how', label: 'How it works' },
];

export function Layout() {
  const { pathname, hash } = useLocation();
  const tone = useChapterTone(72, pathname);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <header className="sk-header" data-tone={tone}>
        <Link to="/" className="wordmark" aria-label="SkinKey home">
          SkinKey
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
        <Link to="/check?sample=1" className="btn btn-primary btn-sm">
          Try a sample share
        </Link>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="sk-footer">
        <div className="footer-top">
          <div>
            <p>SkinKey checks a listing's skin-type claim against its own ingredient list and your YouCam readings.</p>
            <p>{COPY.footer}</p>
            <p>{COPY.notAffiliated}</p>
          </div>
          <a href="#main" className="text-link">
            Back to top
          </a>
        </div>
        <Link to="/" className="footer-mark" aria-label="SkinKey home">
          SkinKey
        </Link>
        <div className="footer-meta">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <ul>
            <li>Skin readings, skin tone and try-on: YouCam API by Perfect Corp.</li>
            <li>Label and title reading: Claude by Anthropic. Verdicts come from published rules only.</li>
            <li>Type: Newsreader and Commissioner (SIL Open Font License).</li>
            {CREDITS.map((c) => (
              <li key={c.file}>
                Plate: <a href={c.page}>{c.title}</a>, {c.creator}, {c.date}. {c.license}, via {c.via}.
              </li>
            ))}
          </ul>
          <p>
            Built for the YouCam API Skin AI &amp; eCommerce VTO Hackathon
            <br />
            November 2026
          </p>
        </div>
      </footer>
    </>
  );
}
