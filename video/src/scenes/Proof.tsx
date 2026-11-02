import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { MONO, SANS } from "../fonts";
import { Ground, Kinetic, Label, Phone, Stamp, usePop } from "../components";
import { cue, meta } from "../timing";

const ID = "proof";

export const Proof: React.FC = () => {
  const { fps } = useVideoConfig();
  const m = meta(ID);
  const p1 = usePop(4);
  const p2 = usePop(14);
  const frozenAt = cue(ID, "frozen", fps, 1, 150);
  const lines = [
    { t: "Real task IDs", at: cue(ID, "task", fps, 1, 70) },
    { t: "Real deletes", at: cue(ID, "deletes", fps, 1, 110) },
    { t: "Rules frozen in git", at: frozenAt },
  ];
  const tag = usePop(cue(ID, "before", fps, 1, frozenAt + 20));
  return (
    <Ground>
      {m.clip ? (
        <>
          <div style={{ position: "absolute", left: 110, top: 90, opacity: p1.opacity, transform: `translateY(${p1.y}px) rotate(-2deg)` }}>
            <Phone clip={m.clip} still="stills/proof_how.png" height={880} />
          </div>
          <div style={{ position: "absolute", left: 560, top: 140, opacity: p2.opacity, transform: `translateY(${p2.y}px) rotate(2.5deg)` }}>
            <Phone still="stills/proof_how.png" height={820} />
            <Label style={{ marginTop: 14, textAlign: "center", fontSize: 24 }}>How this was made</Label>
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", left: 300, top: 60, opacity: p1.opacity, transform: `translateY(${p1.y}px) rotate(-1.5deg)` }}>
          <Phone still="stills/proof_how.png" height={900} />
          <Label style={{ marginTop: 12, textAlign: "center", fontSize: 24 }}>How this was made</Label>
        </div>
      )}
      <div style={{ position: "absolute", left: 1080, top: 120, width: 780 }}>
        <Kinetic scene={ID} text="It shows its working." size={92} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 50 }}>
          {lines.map((l, i) => (
            <Stamp key={l.t} at={l.at} tilt={i % 2 ? 1.5 : -1.5} style={{ alignSelf: "flex-start" }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: COLORS.accent, background: COLORS.panel, borderRadius: 18, padding: "14px 30px" }}>{l.t}</div>
            </Stamp>
          ))}
        </div>
        <div style={{ marginTop: 50, opacity: tag.opacity, transform: `translateY(${tag.y}px)`, fontFamily: MONO, fontSize: 25, color: COLORS.muted, lineHeight: 1.5 }}>
          Rules frozen in git: tag rules-frozen,
          <br />
          then audit-run
        </div>
      </div>
    </Ground>
  );
};
