import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Ground, Kinetic, LiveTag, Phone, PhotoCard, Pill, Stamp, usePop } from "../components";
import { cue } from "../timing";

const ID = "tryon";

export const TryOn: React.FC = () => {
  const { fps } = useVideoConfig();
  const phone = usePop(6);
  const tryAt = cue(ID, "try", fps, 1, 45);
  const swatch = usePop(cue(ID, "sunscreen", fps, 1, 12) + 2, { damping: 13, stiffness: 170 });
  return (
    <Ground>
      <div style={{ position: "absolute", left: 140, top: 110, width: 1000 }}>
        <Kinetic scene={ID} text="Tinted sunscreen?" size={120} italic={["sunscreen?"]} />
      </div>
      <div style={{ position: "absolute", left: 900, top: 120, opacity: swatch.opacity, transform: `scale(${swatch.scale}) rotate(7deg)` }}>
        <PhotoCard src="photos/tinted_spf.jpg" w={250} h={312} radius={22} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 450, width: 900 }}>
        <Kinetic scene={ID} text="Try the real shades on your own face" size={60} font="sans" weight={600} after={tryAt - 2} lineHeight={1.15} />
      </div>
      <Stamp at={cue(ID, "youcam", fps, 1, 140)} style={{ position: "absolute", left: 140, top: 660 }}>
        <Pill size={36} bg={COLORS.panel}>YouCam Makeup try-on</Pill>
      </Stamp>
      <Stamp at={cue(ID, "nothing", fps, 1, 190)} tilt={-3} style={{ position: "absolute", left: 140, top: 790 }}>
        <Pill size={44} bg={COLORS.accent} color={COLORS.panel}>Nothing is saved.</Pill>
      </Stamp>
      <div style={{ position: "absolute", left: 1290, top: 70, opacity: phone.opacity, transform: `translateY(${phone.y}px)` }}>
        <Phone footage={ID} height={940} />
      </div>
      <LiveTag at={18} style={{ position: "absolute", left: 140, top: 930 }}>Live YouCam Makeup VTO, Re&apos;equil Sheer Zinc Tinted Sunscreen</LiveTag>
    </Ground>
  );
};
