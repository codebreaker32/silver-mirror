import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS } from "../fonts";
import { Ground, Kinetic, Phone, Pill, Stamp, clamp, usePop } from "../components";
import { cue } from "../timing";

const ID = "share";

export const Share: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tapAt = cue(ID, "tap", fps, 1, 120);
  const pickAt = cue(ID, "pick", fps, 1, 160);
  const phone = usePop(6);
  const sheet = usePop(tapAt - 2, { damping: 16, stiffness: 150 });
  const ring = interpolate(frame, [pickAt, pickAt + 8], [0, 1], clamp);
  const pulse = 1 + 0.06 * Math.sin(Math.max(0, frame - pickAt) / 4) * interpolate(frame - pickAt, [0, 30], [1, 0], clamp);
  const stores = ["Nykaa", "Flipkart", "Amazon"];
  return (
    <Ground>
      <div style={{ position: "absolute", left: 140, top: 110, width: 1000 }}>
        <Kinetic scene={ID} text="Shop the way you already do." size={96} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 400, display: "flex", gap: 22 }}>
        {stores.map((s) => (
          <Stamp key={s} at={cue(ID, s, fps, 1, 60)}>
            <Pill size={40} bg={COLORS.panel}>{s}</Pill>
          </Stamp>
        ))}
      </div>
      {/* share sheet */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 560,
          width: 880,
          borderRadius: 32,
          background: COLORS.panel,
          padding: "36px 44px",
          boxSizing: "border-box",
          opacity: sheet.opacity,
          transform: `translateY(${sheet.y * 2}px)`,
          boxShadow: "0 40px 80px -40px rgba(27,26,34,0.35)",
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 32, fontWeight: 600, color: COLORS.text, marginBottom: 28 }}>Tap share</div>
        <div style={{ display: "flex", gap: 34, alignItems: "flex-start" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 120, height: 120, borderRadius: 30, background: COLORS.well }} />
              <div style={{ width: 90, height: 14, borderRadius: 7, background: COLORS.well }} />
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `scale(${pulse})` }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 30,
                background: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 ${6 * ring}px ${COLORS.accent}`,
              }}
            >
              <Img src={staticFile("brand/silver-s.png")} style={{ height: 82 }} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, color: COLORS.text }}>Silver Mirror</div>
          </div>
        </div>
      </div>
      <Stamp at={pickAt + 4} tilt={-3} style={{ position: "absolute", left: 700, top: 500 }}>
        <Pill size={34} bg={COLORS.accent} color={COLORS.panel}>Pick Silver Mirror</Pill>
      </Stamp>
      <div style={{ position: "absolute", left: 1290, top: 70, opacity: phone.opacity, transform: `translateY(${phone.y}px)` }}>
        <Phone footage={ID} height={940} />
      </div>
    </Ground>
  );
};
