import { Vector } from '../../math/vector/Vector';
import { MeshStyle } from '../mesh/Mesh';

export class Triangle {
  constructor(
    private _points: Vector[],
    private _color: string,
    private _style: MeshStyle,
    private _texturePoints: Vector[] = []
  ) {}

  rasterize() {
    const [
      [p1, { x: u1, y: v1 }],
      [p2, { x: u2, y: v2 }],
      [p3, { x: u3, y: v3 }],
    ] = this._points
      .map((p, i) => [p, this._texturePoints[i]])
      .sort(([p1], [p2]) => p2.y - p1.y);

    const pointsToRaster: {
      x: number;
      y: number;
      texU: number;
      texV: number;
    }[] = [];

    let dv1 = v2 - v1;
    let du1 = u2 - u1;
    let dx1 = p2.x - p1.x;
    let dy1 = p2.y - p1.y;

    let dv2 = v3 - v1;
    let du2 = u3 - u1;
    let dx2 = p3.x - p1.x;
    let dy2 = p3.y - p1.y;

    let daxStep = 0;
    let dbxStep = 0;

    let du1Step = 0;
    let dv1Step = 0;

    let du2Step = 0;
    let dv2Step = 0;

    if (dy1) {
      daxStep = dx1 / Math.abs(dy1);
      du1Step = du1 / Math.abs(dy1);
      dv1Step = dv1 / Math.abs(dy1);
    }

    if (dy2) {
      dbxStep = dx2 / Math.abs(dy2);
      du2Step = du2 / Math.abs(dy2);
      dv2Step = dv2 / Math.abs(dy2);
    }

    for (let i = p1.y; i <= p2.y; i++) {
      let ax = p1.x + (i - p1.y) * daxStep;
      let bx = p1.x + (i - p1.y) * dbxStep;

      let uStart = u1 + (i - p1.y) * du1Step;
      let vStart = v1 + (i - p1.y) * dv1Step;

      let uEnd = u1 + (i - p1.y) * du2Step;
      let vEnd = v1 + (i - p1.y) * dv2Step;

      if (ax > bx) {
        [ax, bx] = [bx, ax];
        [uStart, vStart] = [vStart, uStart];
        [uEnd, vEnd] = [vEnd, uEnd];
      }

      let texU = 0;
      let texV = 0;
      const tStep = 1 / (bx - ax);
      let t = 0;

      for (let j = ax; j < bx; j++) {
        texU = (1 - t) * uStart + t * uEnd;
        texV = (1 - t) * vStart + t * vEnd;

        t += tStep;

        pointsToRaster.push({ x: j, y: i, texU, texV });
      }
    }

    dx1 = p3.x - p1.x;
    dy1 = p3.y - p1.y;
    du1 = u3 - u1;
    dv1 = v3 - v1;

    du1Step = 0;
    dv1Step = 0;

    if (dy1) {
      daxStep = dx1 / Math.abs(dy1);
      du1Step = du1 / Math.abs(dy1);
      dv1Step = dv1 / Math.abs(dy1);
    }

    if (dy2) {
      dbxStep = dx2 / Math.abs(dy2);
    }

    for (let i = p2.y; i <= p3.y; i++) {
      let ax = p2.x + (i - p2.y) * daxStep;
      let bx = p1.x + (i - p1.y) * dbxStep;

      let uStart = u2 + (i - p2.y) * du1Step;
      let vStart = v2 + (i - p2.y) * dv1Step;

      let uEnd = u1 + (i - p1.y) * du2Step;
      let vEnd = v1 + (i - p1.y) * dv2Step;

      if (ax > bx) {
        [ax, bx] = [bx, ax];
        [uStart, vStart] = [vStart, uStart];
        [uEnd, vEnd] = [vEnd, uEnd];
      }

      let texU = 0;
      let texV = 0;
      const tStep = 1 / (bx - ax);
      let t = 0;

      for (let j = ax; j < bx; j++) {
        texU = (1 - t) * uStart + t * uEnd;
        texV = (1 - t) * vStart + t * vEnd;

        t += tStep;

        pointsToRaster.push({ x: j, y: i, texU, texV });
      }
    }
    return pointsToRaster;
  }

  get points() {
    return this._points;
  }

  get color() {
    return this._color;
  }

  set color(c: string) {
    this._color = c;
  }

  get style() {
    return this._style;
  }

  get texturePoints() {
    return this._texturePoints;
  }

  get hasTexture() {
    return !!this._texturePoints.length;
  }
}
