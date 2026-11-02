import { SCENE_META, SceneMeta } from "./durations";
import { NARRATION, VOICE_LEAD } from "./constants";

export const meta = (id: string): SceneMeta => {
  const m = SCENE_META.find((s) => s.id === id);
  if (!m) throw new Error(`unknown scene ${id}`);
  return m;
};

export const norm = (w: string) => w.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]/g, "");

type Tok = { w: string; t: number };
const cache: Record<string, Tok[]> = {};

// Word times in ms from the start of the voice clip. Real speech marks when present,
// otherwise an estimate spread over the voice length (or the scene length without voice).
export const tokens = (id: string): Tok[] => {
  if (cache[id]) return cache[id];
  const m = meta(id);
  let out: Tok[];
  if (m.marks && m.marks.length) {
    out = m.marks.map((x) => ({ w: norm(x.w), t: x.t })).filter((x) => x.w.length > 0);
  } else {
    const words = NARRATION[id].split(/\s+/).filter(Boolean);
    const total = (m.voiceSeconds ?? Math.max(1, m.seconds - VOICE_LEAD - 0.8)) * 1000;
    const weights = words.map((w) => 1 + w.length * 0.12 + (/[.,:?]$/.test(w) ? 1.1 : 0));
    const sum = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    out = words.map((w, i) => {
      const t = (acc / sum) * total;
      acc += weights[i];
      return { w: norm(w), t };
    });
  }
  cache[id] = out;
  return out;
};

const msToFrame = (ms: number, fps: number) => Math.round(((VOICE_LEAD * 1000 + ms) / 1000) * fps);

// Frame (scene-local) at which the nth occurrence of `word` is spoken.
export const cue = (id: string, word: string, fps: number, nth = 1, fallbackFrame = 0): number => {
  const toks = tokens(id);
  const target = norm(word);
  let seen = 0;
  for (const t of toks) {
    if (t.w === target || (target.length > 3 && t.w.startsWith(target))) {
      seen++;
      if (seen === nth) return msToFrame(t.t, fps);
    }
  }
  return fallbackFrame;
};

// Frames for each word of `phrase`, located in order within the scene's narration.
export const phraseFrames = (id: string, phrase: string, fps: number, after = 0): number[] => {
  const toks = tokens(id);
  const words = phrase.split(/\s+/).filter(Boolean).map(norm);
  const frames: number[] = [];
  let pos = 0;
  // start search after the token at time >= after (scene frames)
  while (pos < toks.length && msToFrame(toks[pos].t, fps) < after) pos++;
  let lastT = pos < toks.length ? toks[pos].t : 0;
  for (const w of words) {
    let found = -1;
    for (let k = pos; k < Math.min(toks.length, pos + 6); k++) {
      if (toks[k].w === w) { found = k; break; }
    }
    if (found >= 0) {
      lastT = toks[found].t;
      pos = found + 1;
    } else {
      lastT += 220;
    }
    frames.push(msToFrame(lastT, fps));
  }
  return frames;
};
