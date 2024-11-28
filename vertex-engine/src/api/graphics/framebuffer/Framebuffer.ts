import { Fragment } from '../shader';
export const quality = 1;

export class Framebuffer {
  _offscreenCanvas: OffscreenCanvas;
  _offscreenCtx: OffscreenCanvasRenderingContext2D;
  _bitmap: ImageData;
  private _xDenom: number;
  private _yDenom: number;

  constructor(
    private _canvas: HTMLCanvasElement,
    private _ctx: CanvasRenderingContext2D
  ) {
    this._offscreenCanvas = new OffscreenCanvas(
      _canvas.width * quality,
      _canvas.height * quality
    );
    const offscreenCtx = this._offscreenCanvas.getContext('2d', {
      alpha: false,
    });

    if (!offscreenCtx)
      throw new Error('Could not retrieve context for offscreen canvas');
    this._offscreenCtx = <OffscreenCanvasRenderingContext2D>offscreenCtx;
    this._offscreenCtx.imageSmoothingEnabled = false;

    this._xDenom = (quality * this._canvas.width) / 2;
    this._yDenom = (quality * this._canvas.height) / 2;
    this._bitmap = new ImageData(_canvas.width, _canvas.height);
  }

  drawFragments(fragments: Fragment[]) {
    for (let i = 0; i < fragments.length; i++) {
      const { x, y, pixelColor } = fragments[i];
      const index =
        (Math.floor(y + this._yDenom) * this._bitmap.width +
          Math.floor(x + this._xDenom)) *
        4;

      this._bitmap.data[index] = pixelColor[0];
      this._bitmap.data[index + 1] = pixelColor[1];
      this._bitmap.data[index + 2] = pixelColor[2];
      this._bitmap.data[index + 3] = pixelColor[3];
    }
  }

  drawToScreen() {
    this._offscreenCtx.putImageData(this._bitmap, 0, 0);
    this._ctx.drawImage(
      this._offscreenCanvas,
      0,
      0,
      this._canvas.width * quality,
      this._canvas.height * quality,
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );
    this._bitmap.data.fill(0);
  }

  get offscreenCtx() {
    return this._offscreenCtx;
  }
}
