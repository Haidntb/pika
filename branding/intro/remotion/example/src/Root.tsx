// Ví dụ: mỗi kiểu một Composition 16:9, và một video ghép intro với cảnh tiếp theo.
import React from 'react';
import { AbsoluteFill, Composition, Sequence } from 'remotion';
import { PikaIntro, pikaIntroDuration } from './pika-intro/remotion/PikaIntro';
import { VARIANT_IDS } from './pika-intro/core/pika-intro.js';

const FPS = 30, frames = (v: string) => Math.round(pikaIntroDuration(v) * FPS);

const WithNextScene: React.FC = () => (
  <AbsoluteFill style={{ background: '#FFFFFF' }}>
    <Sequence durationInFrames={frames('P1')}><PikaIntro variant="P1" /></Sequence>
    <Sequence from={frames('P1')}>
      <AbsoluteFill style={{ background: '#EDFBFD', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 96, fontWeight: 800, color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>Cảnh tiếp theo</h1>
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    {VARIANT_IDS.map(v => (
      <Composition key={v} id={`PikaIntro-${v}`} component={PikaIntro} defaultProps={{ variant: v }}
        durationInFrames={frames(v)} fps={FPS} width={1920} height={1080} />
    ))}
    <Composition id="IntroThenScene" component={WithNextScene} durationInFrames={frames('P1') + 3 * FPS} fps={FPS} width={1920} height={1080} />
  </>
);
