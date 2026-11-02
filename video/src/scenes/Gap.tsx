import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS, SERIF } from "../fonts";
import { Ground, Label, usePop, clamp } from "../components";
import { cue } from "../timing";

const ID = "gap";

const Row: React.FC<{ at: number; title: string; line: string; strike?: boolean }> = ({ at, title, line, strike }) => {
  const p = usePop(at);
  const frame = useCurrentFrame();
  const strikeW = strike ? interpolate(frame - at - 18, [0, 10], [0, 100], clamp) : 0;
  return (
    <div style={{ opacity: p.opacity, transform: `translateY(${p.y}px)`, marginBottom: 90 }}>
      <div style={{ fontFamily: SERIF, fontSize: 88, color: COLORS.text, lineHeight: 1.05 }}>{title}</div>
      <div style={{ position: "relative", display: "inline-block", fontFamily: SANS, fontSize: 42, color: COLORS.muted, marginTop: 14 }}>
        {line}
        <div style={{ position: "absolute", left: 0, top: "54%", height: 4, width: `${strikeW}%`, background: COLORS.amber, borderRadius: 2 }} />
      </div>
    </div>
  );
};

export const Gap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const storeAt = cue(ID, "store", fps, 1, 8);
  const listingAt = cue(ID, "listing", fps, 1, 80);
  const usAt = Math.min(cue(ID, "knows", fps, 1, 110) + 4, durationInFrames - 50);
  const divider = interpolate(frame, [storeAt + 6, storeAt + 26], [0, 1], clamp);
  const us = usePop(usAt, { damping: 15, stiffness: 160 });
  return (
    <Ground>
      {/* them */}
      <div style={{ position: "absolute", left: 140, top: 180, width: 780 }}>
        <Label style={{ marginBottom: 56, fontSize: 32, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>Them</Label>
        <Row at={storeAt} title="Store skin quizzes" line="Only know their own catalogue." />
        <Row at={listingAt} title="Every listing" line="Doesn't know your skin." />
      </div>
      <div style={{ position: "absolute", left: 958, top: 140, width: 4, height: 800, borderRadius: 2, background: COLORS.hairline, transform: `scaleY(${divider})`, transformOrigin: "top" }} />
      {/* us */}
      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 150,
          width: 760,
          height: 740,
          borderRadius: 32,
          background: COLORS.panel,
          padding: 64,
          boxSizing: "border-box",
          opacity: us.opacity,
          transform: `scale(${us.scale})`,
          boxShadow: "0 40px 80px -40px rgba(27,26,34,0.35)",
        }}
      >
        <Label style={{ marginBottom: 40, fontSize: 32 }}>Us</Label>
        <Img src={staticFile("brand/silver-s.png")} style={{ height: 150 }} />
        <div style={{ fontFamily: SERIF, fontSize: 84, color: COLORS.text, marginTop: 24 }}>Silver Mirror</div>
        <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 500, color: COLORS.accent, marginTop: 20, lineHeight: 1.3 }}>
          Starts from your skin.
          <br />
          Reads the listing you share.
        </div>
      </div>
    </Ground>
  );
};
