import { Fragment } from '../shader';
const scale = 1;

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
      _canvas.width * scale,
      _canvas.height * scale
    );
    const offscreenCtx = this._offscreenCanvas.getContext('2d', {
      alpha: false,
    });

    if (!offscreenCtx)
      throw new Error('Could not retrieve context for offscreen canvas');
    this._offscreenCtx = <OffscreenCanvasRenderingContext2D>offscreenCtx;
    this._offscreenCtx.imageSmoothingEnabled = false;

    this._xDenom = (scale * this._canvas.width) / 2;
    this._yDenom = (scale * this._canvas.height) / 2;
    this._bitmap = new ImageData(_canvas.width, _canvas.height);
  }

  drawFragments(fragments: Fragment[]) {
    const data = this._bitmap.data;
    const width = this._bitmap.width;
    const denomX = this._xDenom;
    const denomY = this._yDenom;

    for (let i = 0; i < fragments.length; i++) {
      const { x, y, pixelColor } = fragments[i];
      const index =
        (Math.floor(y + denomY) * width + Math.floor(x + denomX)) * 4;

      data[index] = pixelColor[0];
      data[index + 1] = pixelColor[1];
      data[index + 2] = pixelColor[2];
      data[index + 3] = pixelColor[3];
    }
  }

  drawToScreen() {
    this._offscreenCtx.putImageData(this._bitmap, 0, 0);
    this._ctx.drawImage(
      this._offscreenCanvas,
      0,
      0,
      this._canvas.width * scale,
      this._canvas.height * scale,
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
