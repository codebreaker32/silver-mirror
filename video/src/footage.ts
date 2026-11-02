// Real phone footage (Aman's Samsung, adb screenrecord 720x1560), cut by scripts/cut-clips.sh
// into constant-30fps segments. Masks are in source pixels and hide store/debug labels
// ("Pasted link", rule codes) that the video should not show.
export type Mask = { x: number; y: number; w: number; h: number; color: string };
export type Segment = { src: string; seconds: number; masks?: Mask[]; hold?: string };

export const SRC_W = 720;
export const SRC_H = 1560;

const CARD = "rgb(246,245,250)";
const BG = "rgb(236,235,242)";

export const FOOTAGE: Record<string, Segment[]> = {
  scan: [
    { src: "clips/scan_1.mp4", seconds: 4 },
    { src: "clips/scan_2.mp4", seconds: 7.5 },
    { src: "clips/scan_3.mp4", seconds: 5.2 },
    { src: "clips/scan_4.mp4", seconds: 4.5 },
  ],
  share: [
    { src: "clips/share_1.mp4", seconds: 4.5 },
    { src: "clips/share_2.mp4", seconds: 8 },
  ],
  verdict: [
    { src: "clips/verdict_1.mp4", seconds: 3.5, masks: [{ x: 104, y: 845, w: 160, h: 32, color: BG }] },
    {
      src: "clips/verdict_2.mp4",
      seconds: 11.7,
      masks: [
        { x: 368, y: 584, w: 84, h: 30, color: CARD },
        { x: 62, y: 703, w: 370, h: 34, color: CARD },
      ],
    },
    { src: "clips/verdict_3.mp4", seconds: 2.3 },
  ],
  tryon: [
    { src: "clips/tryon_1.mp4", seconds: 4 },
    { src: "clips/tryon_2.mp4", seconds: 4 },
    { src: "clips/tryon_3.mp4", seconds: 5 },
  ],
  tour: [
    { src: "clips/tour_1.mp4", seconds: 3.4 },
    { src: "clips/tour_2.mp4", seconds: 4 },
    { src: "clips/tour_3.mp4", seconds: 7.3 },
  ],
};

// Scene-local start frame of each segment.
export const segmentStarts = (id: string, fps: number): number[] => {
  let acc = 0;
  return (FOOTAGE[id] ?? []).map((s) => {
    const at = acc;
    acc += Math.round(s.seconds * fps);
    return at;
  });
};
