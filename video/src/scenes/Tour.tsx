import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS, SERIF } from "../fonts";
import { Dot, Ground, Phone, PhotoCard, usePop } from "../components";
import { cue, meta } from "../timing";

const ID = "tour";

const ROUTINE = [
  { slot: "Morning", items: [["cleanser", "Gentle cleanser"], ["serum", "Niacinamide serum"], ["sunscreen", "SPF 50 sunscreen"]] },
  { slot: "Evening", items: [["cleanser", "Gentle cleanser"], ["moisturiser", "Light moisturiser"]] },
];

const RoutineCard: React.FC<{ height: number }> = ({ height }) => (
  <div style={{ width: 470, height, borderRadius: 40, background: COLORS.panel, padding: "40px 36px", boxSizing: "border-box", boxShadow: "0 40px 80px -36px rgba(27,26,34,0.4)" }}>
    <div style={{ fontFamily: SERIF, fontSize: 52, color: COLORS.text, marginBottom: 22 }}>Your routine</div>
    {ROUTINE.map((r) => (
      <div key={r.slot} style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, color: COLORS.muted, marginBottom: 12 }}>{r.slot}</div>
        {r.items.map(([img, name]) => (
          <div key={name + r.slot} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <PhotoCard src={`photos/${img}.jpg`} w={64} h={64} radius={14} />
            <div style={{ flex: 1, fontFamily: SANS, fontSize: 25, fontWeight: 500, color: COLORS.text }}>{name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.sageTint, color: COLORS.sage, borderRadius: 999, padding: "6px 14px", fontFamily: SANS, fontWeight: 700, fontSize: 20 }}>
              <Dot color={COLORS.sage} size={10} />
              Fits
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Slot: React.FC<{ at: number; caption: string; children: React.ReactNode }> = ({ at, caption, children }) => {
  const p = usePop(at, { damping: 15, stiffness: 150 });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p.opacity, transform: `translateY(${p.y * 2}px) scale(${p.scale})` }}>
      {children}
      <div style={{ fontFamily: SANS, fontSize: 32, fontWeight: 600, color: COLORS.text, marginTop: 26, textAlign: "center", width: 520 }}>{caption}</div>
    </div>
  );
};

export const Tour: React.FC = () => {
  const { fps } = useVideoConfig();
  const m = meta(ID);
  const a = cue(ID, "reading", fps, 1, 6);
  const b = cue(ID, "routine", fps, 1, 80);
  const c = cue(ID, "shop", fps, 1, 200);
  const H1 = 800;
  const captions = ["Your reading, in plain words", "A routine of products that fit you", "A shop of verified products"];
  if (m.clip) {
    // Recording mode: one phone plays the tour, captions land beside it.
    return (
      <Ground>
        <div style={{ position: "absolute", left: 220, top: 70 }}>
          <Phone clip={m.clip} still="stills/tour_reading.png" height={940} />
        </div>
        <div style={{ position: "absolute", left: 860, top: 220, display: "flex", flexDirection: "column", gap: 70 }}>
          {[a, b, c].map((at, i) => (
            <Caption key={i} at={at} text={captions[i]} />
          ))}
        </div>
      </Ground>
    );
  }
  return (
    <Ground>
      <div style={{ position: "absolute", left: 0, top: 70, width: 1920, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 90 }}>
        <Slot at={a} caption={captions[0]}>
          <Phone still="stills/tour_reading.png" height={H1} />
        </Slot>
        <Slot at={b} caption={captions[1]}>
          <RoutineCard height={H1} />
        </Slot>
        <Slot at={c} caption={captions[2]}>
          <Phone still="stills/tour_shop.png" height={H1} />
        </Slot>
      </div>
    </Ground>
  );
};

const Caption: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const p = usePop(at);
  return <div style={{ opacity: p.opacity, transform: `translateY(${p.y}px)`, fontFamily: SERIF, fontSize: 68, color: COLORS.text, width: 960 }}>{text}</div>;
};
