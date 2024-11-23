import { setImageDataPixel } from '../rasterizer/Rasterizer.utils';
import { Fragment } from '../shader';

export class Framebuffer {
  _offscreenCanvas: OffscreenCanvas;
  _offscreenCtx: OffscreenCanvasRenderingContext2D;
  _bitmap: ImageData;

  constructor(
    private _canvas: HTMLCanvasElement,
    private _ctx: CanvasRenderingContext2D
  ) {
    this._offscreenCanvas = new OffscreenCanvas(_canvas.width, _canvas.height);
    const offscreenCtx = this._offscreenCanvas.getContext('2d', {
      alpha: false,
    });

    if (!offscreenCtx)
      throw new Error('Could not retrieve context for offscreen canvas');
    this._offscreenCtx = <OffscreenCanvasRenderingContext2D>offscreenCtx;
    this._offscreenCtx.imageSmoothingEnabled = false;

    this._bitmap = new ImageData(_canvas.width, _canvas.height);
  }

  drawFragments(fragments: Fragment[]) {
    fragments.forEach((fragment) => {
      const { x, y, pixelColor } = fragment;
      setImageDataPixel(
        pixelColor,
        x + this._canvas.width / 2,
        y + this._canvas.height / 2,
        this._bitmap
      );
    });
  }

  drawToScreen() {
    this._offscreenCtx.putImageData(this._bitmap, 0, 0);
    this._ctx.drawImage(this._offscreenCanvas, 0, 0);
    this._bitmap.data.fill(0);
  }

  get offscreenCtx() {
    return this._offscreenCtx;
  }
}
