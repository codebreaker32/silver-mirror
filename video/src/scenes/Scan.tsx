import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS } from "../fonts";
import { Ground, Kinetic, Label, LiveTag, Phone, Pill, Stamp, usePop } from "../components";
import { cue } from "../timing";

const ID = "scan";
const METRICS = ["Oiliness", "Pores", "Moisture", "Redness"];
const LEVELS = [
  { l: "Low", n: 1 },
  { l: "Medium", n: 2 },
  { l: "High", n: 3 },
];

const Bars: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 22, height: 12, borderRadius: 6, background: i < n ? COLORS.accent : COLORS.hairline }} />
    ))}
  </div>
);

export const Scan: React.FC = () => {
  const { fps } = useVideoConfig();
  const scanAt = cue(ID, "scan", fps, 1, 60);
  const readsAt = cue(ID, "youcams", fps, 1, 110);
  const delAt = cue(ID, "deleted", fps, 1, 300);
  const onlyAt = cue(ID, "only", fps, 1, 360);
  const phone = usePop(4);
  const readsLabel = usePop(readsAt);
  const onlyLabel = usePop(onlyAt);
  return (
    <Ground>
      <div style={{ position: "absolute", left: 150, top: 80, opacity: phone.opacity, transform: `translateY(${phone.y}px)` }}>
        <Phone footage={ID} height={920} />
      </div>
      <div style={{ position: "absolute", left: 720, top: 90, width: 1080 }}>
        <Kinetic scene={ID} text="One consented scan." size={92} after={scanAt - 30} />
      </div>
      <div style={{ position: "absolute", left: 720, top: 262 }}>
        <Label style={{ opacity: readsLabel.opacity, marginBottom: 22 }}>YouCam HD Skin Analysis reads</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: 18, justifyContent: "start" }}>
          {METRICS.map((x) => (
            <Stamp key={x} at={cue(ID, x, fps, 1, 150)} tilt={0}>
              <Pill size={34} bg={COLORS.panel}>{x}</Pill>
            </Stamp>
          ))}
        </div>
      </div>
      <Stamp at={delAt + 2} tilt={-3} style={{ position: "absolute", left: 720, top: 545 }}>
        <Pill size={34} bg={COLORS.accent} color={COLORS.panel}>Photo deleted from YouCam</Pill>
      </Stamp>
      <div style={{ position: "absolute", left: 720, top: 720, width: 1100 }}>
        <Label style={{ opacity: onlyLabel.opacity, transform: `translateY(${onlyLabel.y}px)`, marginBottom: 24, fontSize: 30 }}>
          Only this stays on your phone
        </Label>
        <div style={{ display: "flex", gap: 24 }}>
          {LEVELS.map((x) => (
            <Stamp key={x.l} at={cue(ID, x.l, fps, 1, 400)}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, background: COLORS.panel, borderRadius: 999, padding: "20px 34px", fontFamily: SANS, fontWeight: 600, fontSize: 40, color: COLORS.text }}>
                {x.l}
                <Bars n={x.n} />
              </div>
            </Stamp>
          ))}
        </div>
      </div>
      <LiveTag at={12} style={{ position: "absolute", left: 720, top: 960 }}>Live YouCam HD Skin Analysis. Photo deleted after.</LiveTag>
    </Ground>
  );
};
