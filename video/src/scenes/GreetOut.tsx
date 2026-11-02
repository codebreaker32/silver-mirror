import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SERIF, SERIF_ITALIC } from "../fonts";
import { usePop } from "../components";
import { cue } from "../timing";

const ID = "greetOut";

// Closing greeting: "Thank you", "Namaste", the S mark over the welcome image.
export const GreetOut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.06]);
  const thanks = usePop(Math.max(2, cue(ID, "thank", fps, 1, 6) - 3));
  const hi = usePop(cue(ID, "namaste", fps, 1, 70) - 4);
  const s = usePop(cue(ID, "namaste", fps, 1, 70) + 6, { damping: 14, stiffness: 110 });
  return (
    <AbsoluteFill style={{ background: COLORS.ground, overflow: "hidden" }}>
      <Img src={staticFile("brand/welcome-backdrop.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(237,236,242,0.74) 0%, rgba(237,236,242,0.4) 55%, rgba(237,236,242,0.1) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontFamily: SERIF, fontSize: 160, color: COLORS.text, letterSpacing: "0.01em", lineHeight: 1.05, opacity: thanks.opacity, transform: `translateY(${thanks.y}px)` }}>Thank you</div>
        <div style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 96, color: COLORS.accent, marginTop: 14, opacity: hi.opacity, transform: `translateY(${hi.y}px)` }}>Namaste</div>
        <Img src={staticFile("brand/silver-s.png")} style={{ height: 150, marginTop: 40, opacity: s.opacity, transform: `scale(${s.scale}) translateY(${s.y}px)` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
