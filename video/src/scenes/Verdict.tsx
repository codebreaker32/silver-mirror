import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS, SERIF } from "../fonts";
import { Dot, Ground, Kinetic, Label, Phone, Stamp, VERDICTS, usePop } from "../components";
import { cue } from "../timing";

const ID = "verdict";

const Part: React.FC<{ at: number; k: string; v: string }> = ({ at, k, v }) => {
  const p = usePop(at);
  return (
    <div style={{ opacity: p.opacity, transform: `translateY(${p.y}px)`, flex: 1 }}>
      <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 500, color: COLORS.muted }}>{k}</div>
      <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 600, color: COLORS.text, marginTop: 6 }}>{v}</div>
    </div>
  );
};

export const Verdict: React.FC = () => {
  const { fps } = useVideoConfig();
  const phone = usePop(4);
  const label = usePop(2);
  const reasonAt = cue(ID, "every", fps, 1, 130);
  const card = usePop(reasonAt);
  const claudeAt = cue(ID, "claude", fps, 1, 260);
  const tilts = [-4, 3, -2];
  return (
    <Ground>
      <div style={{ position: "absolute", left: 150, top: 80, opacity: phone.opacity, transform: `translateY(${phone.y}px)` }}>
        <Phone footage={ID} height={920} />
      </div>
      <div style={{ position: "absolute", left: 720, top: 96 }}>
        <Label style={{ opacity: label.opacity, fontSize: 32 }}>Seconds later</Label>
        <div style={{ display: "flex", gap: 30, marginTop: 26 }}>
          {(["fits", "caution", "unknown"] as const).map((k, i) => {
            const v = VERDICTS[k];
            return (
              <Stamp key={k} at={cue(ID, k, fps, 1, 20 + i * 15)} tilt={tilts[i]}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "22px 38px",
                    borderRadius: 999,
                    background: v.bg,
                    border: `4px solid ${v.fg}`,
                    color: v.fg,
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 56,
                  }}
                >
                  <Dot color={v.fg} size={26} />
                  {v.label}
                </div>
              </Stamp>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 720,
          top: 380,
          width: 1060,
          borderRadius: 28,
          background: COLORS.panel,
          padding: "34px 44px",
          boxSizing: "border-box",
          opacity: card.opacity,
          transform: `translateY(${card.y}px)`,
          boxShadow: "0 30px 60px -36px rgba(27,26,34,0.35)",
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 44, color: COLORS.text, marginBottom: 26 }}>Every reason names</div>
        <div style={{ display: "flex", gap: 30 }}>
          <Part at={cue(ID, "ingredient", fps, 1, 170)} k="The ingredient" v="Glycerin" />
          <Part at={cue(ID, "reading", fps, 1, 190)} k="Your reading" v="U-zone · Dry" />
          <Part at={cue(ID, "rule", fps, 1, 210)} k="The rule" v="Humectant fits dry skin" />
        </div>
      </div>
      <div style={{ position: "absolute", left: 720, top: 700, width: 1080 }}>
        <Kinetic scene={ID} text="Claude only reads the listing." size={56} after={claudeAt - 4} color={COLORS.muted} />
        <div style={{ height: 14 }} />
        <Kinetic scene={ID} text="Our published rules decide." size={72} after={claudeAt + 20} color={COLORS.accent} />
      </div>
    </Ground>
  );
};
