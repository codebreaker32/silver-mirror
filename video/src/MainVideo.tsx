import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FADE, VOICE_LEAD } from "./constants";
import { SCENE_META } from "./durations";
import { Hook } from "./scenes/Hook";
import { Shelf } from "./scenes/Shelf";
import { Gap } from "./scenes/Gap";
import { Scan } from "./scenes/Scan";
import { Share } from "./scenes/Share";
import { Verdict } from "./scenes/Verdict";
import { TryOn } from "./scenes/TryOn";
import { Tour } from "./scenes/Tour";
import { Proof } from "./scenes/Proof";
import { Close } from "./scenes/Close";
import "./fonts";

// Scene durations come from src/durations.ts (generated from public/voiceover/durations.json:
// voice seconds + 0.3s lead + 0.6s tail, or fixed estimates when no voice exists yet).
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  shelf: Shelf,
  gap: Gap,
  scan: Scan,
  share: Share,
  verdict: Verdict,
  tryon: TryOn,
  tour: Tour,
  proof: Proof,
  close: Close,
};

export const sceneFrames = (fps: number) => SCENE_META.map((s) => Math.round(s.seconds * fps));
export const totalFrames = (fps: number) => sceneFrames(fps).reduce((a, b) => a + b, 0);

// Soft fade at each boundary over the constant lavender ground (no whooshes).
const Fade: React.FC<{ first: boolean; last: boolean; children: React.ReactNode }> = ({ first, last, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fin = first ? 1 : interpolate(frame, [0, FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fout = interpolate(frame, [durationInFrames - FADE, durationInFrames], [1, last ? 0 : 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>{children}</AbsoluteFill>;
};

export const SceneWithVoice: React.FC<{ id: string; first?: boolean; last?: boolean }> = ({ id, first = false, last = false }) => {
  const { fps } = useVideoConfig();
  const meta = SCENE_META.find((s) => s.id === id)!;
  const Comp = SCENES[id];
  return (
    <AbsoluteFill style={{ background: COLORS.ground }}>
      <Fade first={first} last={last}>
        <Comp />
      </Fade>
      {meta.voice ? (
        <Sequence from={Math.round(VOICE_LEAD * fps)} layout="none">
          <Audio src={staticFile(meta.voice)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const frames = sceneFrames(fps);
  return (
    <AbsoluteFill style={{ background: COLORS.ground }}>
      <Series>
        {SCENE_META.map((s, i) => (
          <Series.Sequence key={s.id} durationInFrames={frames[i]} name={s.id}>
            <SceneWithVoice id={s.id} first={i === 0} last={i === SCENE_META.length - 1} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
