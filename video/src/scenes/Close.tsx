import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS, SERIF } from "../fonts";
import { Kinetic, clamp, usePop } from "../components";
import { cue } from "../timing";

const ID = "close";

export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = usePop(2, { damping: 14, stiffness: 120 });
  const name = usePop(Math.max(4, cue(ID, "silver", fps, 1, 10) - 2));
  const checkAt = cue(ID, "check", fps, 1, 50);
  const tag = usePop(checkAt);
  const buyAt = cue(ID, "buy", fps, 1, 80);
  const foot = usePop(checkAt + 20);
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.06]);
  const sheen = interpolate(frame, [0, 60], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: COLORS.ground, overflow: "hidden" }}>
      <Img src={staticFile("brand/welcome-backdrop.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 * sheen, transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Img src={staticFile("brand/silver-s.png")} style={{ height: 210, opacity: s.opacity, transform: `scale(${s.scale}) translateY(${s.y}px)` }} />
        <div style={{ fontFamily: SERIF, fontSize: 150, color: COLORS.text, marginTop: 20, letterSpacing: "0.01em", opacity: name.opacity, transform: `translateY(${name.y}px)` }}>Silver Mirror</div>
        <div style={{ fontFamily: SANS, fontSize: 50, fontWeight: 500, color: COLORS.accent, marginTop: 6, opacity: tag.opacity, transform: `translateY(${tag.y}px)` }}>Check before you buy.</div>
        <div style={{ marginTop: 44 }}>
          <Kinetic scene={ID} text="Mirror, mirror. Now you know." size={52} italic={["mirror,", "mirror.", "now", "you", "know."]} color={COLORS.muted} after={buyAt + 2} align="center" />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: SANS, fontSize: 26, fontWeight: 500, color: COLORS.muted, opacity: foot.opacity }}>
        Built on YouCam HD Skin Analysis + Makeup VTO
      </div>
    </AbsoluteFill>
  );
};
