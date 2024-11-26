import { Vector } from '../../math/vector/Vector';
import { MeshStyle } from '../mesh/Mesh';

export class Triangle {
  constructor(
    private _points: Vector[],
    private _color: string,
    private _style: MeshStyle,
    private _texturePoints: Vector[] = []
  ) {}

  baryCentricGradients() {
    const {
      points: [[x0, y0], [x1, y1], [x2, y2]],
    } = this;
    const area = this.area;

    return [
      { x: (y2 - y1) / area, y: (x1 - x2) / area },
      { x: (y0 - y2) / area, y: (x2 - x0) / area },
      { x: (y1 - y0) / area, y: (x0 - x1) / area },
    ];
  }

  subTriangleAreas(p: Vector) {
    const {
      points: [[x0, y0], [x1, y1], [x2, y2]],
    } = this;

    const area1 =
      0.5 * Math.abs(p[0] * (y1 - y2) + x1 * (y2 - p[1]) + x2 * (p[1] - y1));
    const area2 =
      0.5 * Math.abs(x0 * (p[1] - y2) + p[0] * (y2 - y0) + x2 * (y0 - p[1]));
    const area3 =
      0.5 * Math.abs(x0 * (y1 - p[1]) + x1 * (p[1] - y0) + p[0] * (y0 - y1));

    return [area1, area2, area3];
  }

  barycentricCoordinates(p: Vector) {
    const totalArea = this.area;
    const subTriangleAreas = this.subTriangleAreas(p);

    return subTriangleAreas.map((area) => area / totalArea);
  }

  get area() {
    const {
      points: [[x0, y0], [x1, y1], [x2, y2]],
    } = this;

    return 0.5 * Math.abs(x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1));
  }

  get points() {
    return this._points;
  }

  set points(points: Vector[]) {
    this._points = points;
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
  set style(style: MeshStyle) {
    this._style = style;
  }

  set texturePoints(texturePoints: Vector[]) {
    this._texturePoints = texturePoints;
  }

  get texturePoints() {
    return this._texturePoints;
  }

  get hasTexture() {
    return !!this._texturePoints.length;
  }
}
