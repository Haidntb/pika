// Intro logo Pika cho Remotion: vẽ lõi core/ lên canvas theo frame hiện tại, kèm tiếng của kiểu đó (tuỳ chọn).
// Đặt trong <Sequence durationInFrames={Math.round(pikaIntroDuration('P1') * fps)}> hoặc làm cả một Composition.
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { createPikaIntro, type PikaIntroVariant } from '../core/pika-intro.js';

export const pikaIntroDuration = (variant: PikaIntroVariant = 'P1') => createPikaIntro({ variant }).duration;   // giây

export type PikaIntroProps = {
  /** Kiểu chuyển động P1…P8 (thêm kiểu: core/variants/). */
  variant?: PikaIntroVariant;
  /** Màu nền, hoặc null để nền trong suốt (đặt intro đè lên cảnh khác). */
  background?: string | null;
  /** Bật tiếng (đọc public/pika-intro/mix-pN.wav), hoặc đường dẫn khác trong public/, hoặc null để tắt. */
  sound?: boolean | string | null;
};

export const PikaIntro: React.FC<PikaIntroProps> = ({ variant = 'P1', background = '#FFFFFF', sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const intro = useMemo(() => createPikaIntro({ width, height, variant, background }), [width, height, variant, background]);
  useLayoutEffect(() => {
    const g = canvas.current?.getContext('2d');
    if (g) intro.render(g, frame / fps);
  }, [intro, frame, fps]);
  const src = sound === true ? `pika-intro/mix-${intro.variant.toLowerCase()}.wav` : sound || null;
  return (
    <AbsoluteFill>
      <canvas ref={canvas} width={width} height={height} style={{ width: '100%', height: '100%' }} />
      {src ? <Audio src={staticFile(src)} /> : null}
    </AbsoluteFill>
  );
};
