import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, H, W } from "./constants";
import { MainVideo, SceneWithVoice, sceneFrames, totalFrames } from "./MainVideo";
import { SCENE_META } from "./durations";

export const RemotionRoot: React.FC = () => {
  const frames = sceneFrames(FPS);
  return (
    <>
      <Composition id="MainVideo" component={MainVideo} durationInFrames={totalFrames(FPS)} fps={FPS} width={W} height={H} />
      {SCENE_META.map((s, i) => (
        <Composition
          key={s.id}
          id={`S-${s.id}`}
          component={SceneWithVoice}
          defaultProps={{ id: s.id }}
          durationInFrames={frames[i]}
          fps={FPS}
          width={W}
          height={H}
        />
      ))}
    </>
  );
};

registerRoot(RemotionRoot);
