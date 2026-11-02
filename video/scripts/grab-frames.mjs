// Pull one review frame per scene out of a rendered video (default: 80% into each scene).
//   node scripts/grab-frames.mjs [out/draft.mp4] [fraction]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const video = process.argv[2] ?? "out/draft.mp4";
const fracs = (process.argv[3] ?? "0.8").split(",").map(Number);
const src = fs.readFileSync(path.join(root, "src/durations.ts"), "utf8");
const json = src.slice(src.indexOf("= [") + 2, src.lastIndexOf("]") + 1);
const scenes = JSON.parse(json);
fs.mkdirSync(path.join(root, "out/frames"), { recursive: true });
let t0 = 0;
for (const s of scenes) {
  const dur = Math.round(s.seconds * 30) / 30;
  for (const f of fracs) {
    const t = (t0 + dur * f).toFixed(2);
    const out = `out/frames/${s.id}_${Math.round(f * 100)}.png`;
    execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-ss", t, "-i", video, "-frames:v", "1", "-vf", "scale=1280:-1", out], { cwd: root, stdio: "inherit" });
    console.log(out, t);
  }
  t0 += dur;
}
