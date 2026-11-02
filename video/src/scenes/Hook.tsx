import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Kinetic, PhotoCard, clamp, usePop } from "../components";
import { cue } from "../timing";

const ID = "hook";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.1, 1.0]);
  const serumAt = cue(ID, "serum", fps, 1, 80);
  const serum = usePop(serumAt, { damping: 12, stiffness: 170 });
  const wobble = Math.sin((frame - serumAt) / 5) * interpolate(frame - serumAt, [0, 40], [6, 0], clamp);
  const line2At = cue(ID, "will", fps, 1, 60);
  return (
    <AbsoluteFill style={{ background: COLORS.ground, overflow: "hidden" }}>
      <Img
        src={staticFile("brand/welcome-backdrop.jpg")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(237,236,242,0.78) 0%, rgba(237,236,242,0.35) 60%, rgba(237,236,242,0.1) 100%)" }} />
      <div style={{ position: "absolute", left: 140, top: 150, width: 1220 }}>
        <Kinetic scene={ID} text="Mirror, mirror, on the wall." size={176} lineHeight={1.02} />
        <div style={{ height: 48 }} />
        <Kinetic scene={ID} text="Will this serum suit me at all?" size={84} after={line2At - 2} italic={["serum"]} color={COLORS.accent} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 170,
          top: 230,
          opacity: serum.opacity,
          transform: `translateY(${serum.y}px) scale(${serum.scale}) rotate(${6 + wobble}deg)`,
        }}
      >
        <PhotoCard src="photos/serum.jpg" w={400} h={500} radius={28} />
      </div>
    </AbsoluteFill>
  );
};
