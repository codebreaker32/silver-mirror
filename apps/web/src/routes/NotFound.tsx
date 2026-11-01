import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>This page doesn't exist.</h1>
        <p>
          Try the <Link to="/check" className="text-link">web check</Link> or go back to the <Link to="/" className="text-link">start</Link>.
        </p>
      </div>
    </div>
  );
}
