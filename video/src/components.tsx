import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./constants";
import { MONO, SANS, SERIF } from "./fonts";
import { phraseFrames } from "./timing";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const usePop = (at: number, config = { damping: 18, stiffness: 160 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config });
  return {
    p,
    opacity: interpolate(p, [0, 0.35], [0, 1], clamp),
    scale: interpolate(p, [0, 1], [0.93, 1]),
    y: interpolate(p, [0, 1], [28, 0]),
  };
};

export const Ground: React.FC<{ children?: React.ReactNode; glow?: boolean }> = ({ children, glow = true }) => (
  <AbsoluteFill
    style={{
      background: glow
        ? `radial-gradient(ellipse at 30% 20%, ${COLORS.panel} 0%, ${COLORS.ground} 60%, #E4E2EC 100%)`
        : COLORS.ground,
    }}
  >
    {children}
  </AbsoluteFill>
);

// Words land one by one in sync with the voice.
export const Kinetic: React.FC<{
  scene: string;
  text: string;
  after?: number;
  font?: "serif" | "sans";
  size: number;
  color?: string;
  weight?: number;
  italic?: string[];
  accent?: string[];
  lineHeight?: number;
  style?: React.CSSProperties;
  align?: "left" | "center";
  delay?: number;
}> = ({ scene, text, after = 0, font = "serif", size, color = COLORS.text, weight, italic = [], accent = [], lineHeight = 1.08, style, align = "left", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);
  const frames = phraseFrames(scene, text, fps, after);
  const it = italic.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""));
  const ac = accent.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""));
  return (
    <div
      style={{
        fontFamily: font === "serif" ? SERIF : SANS,
        fontSize: size,
        fontWeight: weight ?? (font === "serif" ? 400 : 600),
        color,
        lineHeight,
        letterSpacing: font === "serif" ? "-0.01em" : "-0.015em",
        textAlign: align,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = spring({ frame: frame - (frames[i] + delay), fps, config: { damping: 15, stiffness: 190 } });
        const op = interpolate(p, [0, 0.3], [0, 1], clamp);
        const y = interpolate(p, [0, 1], [0.38 * size, 0]);
        const sc = interpolate(p, [0, 1], [0.93, 1]);
        const key = w.toLowerCase().replace(/[^a-z']/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: op,
              transform: `translateY(${y}px) scale(${sc})`,
              transformOrigin: "50% 80%",
              marginRight: "0.24em",
              fontStyle: it.includes(key) ? "italic" : "normal",
              color: ac.includes(key) ? COLORS.accent : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Portrait phone mockup: rounded charcoal bezel, 1080x2340 screen.
export const Phone: React.FC<{
  clip?: string | null;
  still: string;
  height: number;
  style?: React.CSSProperties;
  startFrom?: number;
}> = ({ clip, still, height, style, startFrom = 0 }) => {
  const pad = Math.round(height * 0.018);
  const screenH = height - pad * 2;
  const screenW = Math.round((screenH * 1080) / 2340);
  return (
    <div
      style={{
        width: screenW + pad * 2,
        height,
        padding: pad,
        borderRadius: height * 0.068,
        background: COLORS.bezel,
        boxShadow: "0 40px 80px -30px rgba(27,26,34,0.45), 0 12px 24px -12px rgba(27,26,34,0.25)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          width: screenW,
          height: screenH,
          borderRadius: height * 0.052,
          overflow: "hidden",
          background: COLORS.ground,
          position: "relative",
        }}
      >
        {clip ? (
          <OffthreadVideo
            src={staticFile(clip)}
            startFrom={startFrom}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Img src={staticFile(still)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        )}
      </div>
    </div>
  );
};

export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = COLORS.panel, color = COLORS.text, size = 28, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      padding: `${size * 0.42}px ${size * 0.85}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "-0.01em",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const VERDICTS = {
  fits: { label: "Fits", fg: COLORS.sage, bg: COLORS.sageTint },
  caution: { label: "Caution", fg: COLORS.amber, bg: COLORS.amberTint },
  unknown: { label: "Unknown", fg: COLORS.grey, bg: COLORS.greyTint },
} as const;

// A chip that stamps in: overshoots in scale and settles with a small tilt.
export const Stamp: React.FC<{ at: number; tilt?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, tilt = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 220, mass: 0.7 } });
  const scale = interpolate(p, [0, 1], [1.45, 1]);
  const op = interpolate(frame - at, [0, 4], [0, 1], clamp);
  const rot = interpolate(p, [0, 1], [tilt * 3, tilt]);
  return <div style={{ opacity: op, transform: `scale(${scale}) rotate(${rot}deg)`, ...style }}>{children}</div>;
};

export const Dot: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
  <div style={{ width: size, height: size, borderRadius: 999, background: color, flex: "none" }} />
);

export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 500, color: COLORS.muted, ...style }}>{children}</div>
);

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 24, color: COLORS.muted, ...style }}>{children}</div>
);

export const PhotoCard: React.FC<{ src: string; w: number; h: number; style?: React.CSSProperties; radius?: number }> = ({ src, w, h, style, radius = 20 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: radius,
      overflow: "hidden",
      background: COLORS.panel,
      boxShadow: "0 24px 48px -24px rgba(27,26,34,0.35)",
      ...style,
    }}
  >
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);
