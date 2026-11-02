import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SERIF } from "../fonts";
import { usePop } from "../components";
import { cue } from "../timing";

const ID = "greetIn";

// Opening greeting: the liquid-silver welcome image, the swash S, "Namaste", then "Silver Mirror".
export const GreetIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.0]);
  const s = usePop(0, { damping: 14, stiffness: 110 });
  const hi = usePop(Math.max(3, cue(ID, "namaste", fps, 1, 8) - 3));
  const name = usePop(cue(ID, "silver", fps, 1, 60) - 4);
  return (
    <AbsoluteFill style={{ background: COLORS.ground, overflow: "hidden" }}>
      <Img src={staticFile("brand/welcome-backdrop.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(237,236,242,0.72) 0%, rgba(237,236,242,0.38) 55%, rgba(237,236,242,0.08) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Img src={staticFile("brand/silver-s.png")} style={{ height: 230, opacity: s.opacity, transform: `scale(${s.scale}) translateY(${s.y}px)` }} />
        <div style={{ fontFamily: SERIF, fontSize: 170, color: COLORS.text, marginTop: 18, letterSpacing: "0.01em", lineHeight: 1.05, opacity: hi.opacity, transform: `translateY(${hi.y}px)` }}>Namaste</div>
        <div style={{ fontFamily: SERIF, fontSize: 84, color: COLORS.accent, marginTop: 10, letterSpacing: "0.02em", opacity: name.opacity, transform: `translateY(${name.y}px)` }}>
          Silver Mirror
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
