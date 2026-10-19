// Kiểu cho core/pika-intro.js (dùng trong Remotion / TypeScript).
export type PikaIntroVariant = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | (string & {});
export interface PikaIntroOptions {
  /** Cỡ khung (px). Bản chính thức 1920 x 1080. */
  width?: number;
  height?: number;
  /** Kiểu chuyển động: P1 rơi và bật, P2 nhảy sang, P3 nhảy qua chữ, P4 lăn vào, P5 ló mặt, P6 vẽ nét, P7 đôi mắt trước, P8 giọt nước. */
  variant?: PikaIntroVariant;
  /** Màu nền, hoặc null để nền trong suốt. Mặc định '#FFFFFF'. */
  background?: string | null;
}
export interface SoundCue { t: number; type: string; n?: number }
export interface PikaIntro {
  width: number;
  height: number;
  variant: string;
  title: string;
  /** Thời lượng (giây). */
  duration: number;
  cues: { voice: number; events: SoundCue[] };
  /** Vẽ khung ở thời điểm t (giây) lên context 2D cỡ width x height. */
  render(ctx: CanvasRenderingContext2D, t: number): void;
  renderLogo(ctx: CanvasRenderingContext2D): void;
}
export const VARIANT_IDS: string[];
export const COLORS: { pika: string; facePlate: string };
export function createPikaIntro(options?: PikaIntroOptions): PikaIntro;
export function logoSVG(layout?: 'horizontal' | 'stacked' | 'icon', palette?: 'color' | 'black' | 'white'): string;
