import { encode } from 'uqr';

/** QR code drawn as one SVG path, quiet zone included. */
export function Qr({ value, label }: { value: string; label: string }) {
  const { data, size } = encode(value, { ecc: 'M', border: 0 });
  let d = '';
  data.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)));
  return (
    <div className="qr">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
        <path d={d} fill="var(--sk-color-qr-module)" />
      </svg>
    </div>
  );
}
