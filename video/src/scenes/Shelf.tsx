import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SANS, SERIF } from "../fonts";
import { Ground, Kinetic, PhotoCard, Stamp, clamp, usePop } from "../components";
import { cue } from "../timing";

const ID = "shelf";
const ITEMS = ["cleanser", "moisturiser", "sunscreen", "tinted_spf", "serum"];
const CW = 210;
const CH = 262;
const SHELF_Y = 860;
const X0 = 170;
const GAP = 250;

export const Shelf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tipAt = cue(ID, "didnt", fps, 1, 75);
  const openedAt = cue(ID, "opened", fps, 1, 130);
  const tip = spring({ frame: frame - tipAt, fps, config: { damping: 9, stiffness: 120, mass: 0.9 } });
  const rot = interpolate(tip, [0, 1], [0, 90]);
  const shelfOp = interpolate(frame, [0, 10], [0, 1], clamp);
  const capt = usePop(tipAt + 8, { damping: 14, stiffness: 170 });
  return (
    <Ground>
      <div style={{ position: "absolute", left: 140, top: 110, width: 1600 }}>
        <Kinetic scene={ID} text="Every skincare shelf has one." size={104} />
      </div>
      {/* the shelf */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: SHELF_Y,
          width: 1700,
          height: 22,
          borderRadius: 11,
          background: COLORS.accent,
          opacity: shelfOp,
          boxShadow: "0 18px 30px -16px rgba(27,26,34,0.45)",
        }}
      />
      {ITEMS.map((p, i) => {
        const pop = usePopAt(frame, fps, 4 + i * 5);
        const isTipper = i === ITEMS.length - 1;
        const x = X0 + i * GAP;
        const r = isTipper ? rot : 0;
        // a tiny wobble on the neighbours as the bottle lands
        const wob = isTipper ? 0 : Math.sin((frame - tipAt - 14) / 3) * interpolate(frame - tipAt - 14, [0, 6, 24], [0, 1.6, 0], clamp) * (i === ITEMS.length - 2 ? 1 : 0.4);
        return (
          <div
            key={p}
            style={{
              position: "absolute",
              left: x,
              top: SHELF_Y - CH,
              opacity: pop.op,
              transformOrigin: "100% 100%",
              transform: `translateY(${pop.y}px) rotate(${r + wob}deg)`,
            }}
          >
            <PhotoCard src={`photos/${p}.jpg`} w={CW} h={CH} radius={18} />
            {isTipper ? (
              <Stamp at={openedAt} tilt={-8} style={{ position: "absolute", left: 30, top: 90 }}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 34,
                    color: COLORS.amber,
                    border: `4px solid ${COLORS.amber}`,
                    borderRadius: 12,
                    padding: "4px 16px",
                    background: "rgba(247,246,250,0.9)",
                  }}
                >
                  Opened
                </div>
              </Stamp>
            ) : null}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: X0 + 4 * GAP + 40,
          top: 420,
          opacity: capt.opacity,
          transform: `translateY(${capt.y}px) rotate(-4deg)`,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 64,
          color: COLORS.accent,
          whiteSpace: "nowrap",
        }}
      >
        didn't suit you.
      </div>
      <div style={{ position: "absolute", left: 140, top: 935, width: 1700 }}>
        <Kinetic scene={ID} text="And opened skincare can't go back." size={50} font="sans" weight={500} color={COLORS.muted} after={openedAt - 12} />
      </div>
    </Ground>
  );
};

function usePopAt(frame: number, fps: number, at: number) {
  const p = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 180 } });
  return { op: interpolate(p, [0, 0.3], [0, 1], clamp), y: interpolate(p, [0, 1], [-90, 0]) };
}
