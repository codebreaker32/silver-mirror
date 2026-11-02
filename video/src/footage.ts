// Real phone footage (Aman's Samsung, adb screenrecord 720x1560), cut by scripts/cut-clips.sh
// into constant-30fps segments. share, verdict and tour use the v2 build recordings (new
// app layout); masks (source pixels) remain available but none are needed for v2 footage.
export type Mask = { x: number; y: number; w: number; h: number; color: string };
export type Segment = { src: string; seconds: number; masks?: Mask[]; hold?: string };

export const SRC_W = 720;
export const SRC_H = 1560;

export const FOOTAGE: Record<string, Segment[]> = {
  scan: [
    { src: "clips/scan_1.mp4", seconds: 4 },
    { src: "clips/scan_2.mp4", seconds: 7.5 },
    { src: "clips/scan_3.mp4", seconds: 5.2 },
    { src: "clips/scan_4.mp4", seconds: 4.5 },
  ],
  share: [{ src: "clips/share_1.mp4", seconds: 12.5 }],
  verdict: [{ src: "clips/verdict_1.mp4", seconds: 15, hold: "clips/verdict_hold.png" }],
  tryon: [
    { src: "clips/tryon_1.mp4", seconds: 4 },
    { src: "clips/tryon_2.mp4", seconds: 4 },
    { src: "clips/tryon_3.mp4", seconds: 5 },
  ],
  tour: [
    { src: "clips/tour_1.mp4", seconds: 4.5 },
    { src: "clips/tour_2.mp4", seconds: 3.8 },
    { src: "clips/tour_3.mp4", seconds: 6.4 },
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
