#!/usr/bin/env python3
"""Write out/silver-mirror-demo.srt from the Polly speech marks.

One cue per sentence of the narration in src/constants.ts; sentence boundaries are the
<break> marks Polly returns. Scene offsets come from src/durations.ts (frame-rounded, 30fps).
Usage: python3 scripts/make-srt.py [out.srt]
"""
import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
FPS, LEAD = 30, 0.3
src = (root / "src/durations.ts").read_text()
scenes = json.loads(src[src.index("= [") + 2 : src.rindex("]") + 1])
consts = (root / "src/constants.ts").read_text()
narr = dict(re.findall(r'^\s+(\w+): "(.*)",$', consts[consts.index("NARRATION"):], re.M))

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

cues, t0 = [], 0.0
for s in scenes:
    dur = round(s["seconds"] * FPS) / FPS
    mp = root / "public/voiceover" / f"{s['id']}.marks.json"
    marks = [json.loads(l) for l in mp.read_text().splitlines() if l.strip()] if mp.exists() else []
    sentences = [x.strip() for x in re.split(r"(?<=[.?!])\s+", narr.get(s["id"], "")) if x.strip()]
    groups, cur = [], []
    for m in marks:
        w, t = m.get("value", m.get("w", "")), m.get("time", m.get("t", 0))
        if w.startswith("<") or m.get("type") == "ssml":
            if cur: groups.append((cur, t)); cur = []
        else:
            cur.append(t)
    voice_end = (s.get("voiceSeconds") or 0) * 1000
    if cur: groups.append((cur, voice_end))
    if len(groups) != len(sentences):  # fall back to one cue for the whole scene
        groups, sentences = [([groups[0][0][0]], voice_end)], [" ".join(sentences)]
    for (ws, end), text in zip(groups, sentences):
        cues.append((t0 + LEAD + ws[0] / 1000, t0 + LEAD + end / 1000 + 0.15, text))
    t0 += dur

out = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "out/silver-mirror-demo.srt"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("".join(f"{i}\n{ts(a)} --> {ts(b)}\n{c}\n\n" for i, (a, b, c) in enumerate(cues, 1)))
print(f"{out}: {len(cues)} cues, ends {ts(t0)}")
