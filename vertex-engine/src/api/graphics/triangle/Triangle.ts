import { Vector } from '../../math/vector/Vector';
import { Mesh, MeshStyle } from '../mesh/Mesh';

export class Triangle {
  constructor(
    private _points: Vector[],
    private _color: string,
    private _style: MeshStyle,
    private _texturePoints: Vector[] = []
  ) {}

  subTriangleAreas(p: Vector) {
    const {
      points: [p0, p1, p2],
    } = this;
    return [
      0.5 *
        Math.abs(
          p.x * (p1.y - p2.y) + p1.x * (p2.y - p.y) + p2.x * (p.y - p1.y)
        ),
      0.5 *
        Math.abs(
          p0.x * (p.y - p2.y) + p.x * (p2.y - p0.y) + p2.x * (p0.y - p.y)
        ),
      0.5 *
        Math.abs(
          p0.x * (p1.y - p.y) + p1.x * (p.y - p0.y) + p.x * (p0.y - p1.y)
        ),
    ];
  }

  barycentricCoordinates(p: Vector) {
    const totalArea = this.area;
    const subTriangleAreas = this.subTriangleAreas(p);

    return subTriangleAreas.map((area) => area / totalArea);
  }

  get area() {
    const {
      points: [p0, p1, p2],
    } = this;
    return (
      0.5 *
      Math.abs(
        p0.x * (p1.y - p2.y) + p1.x * (p2.y - p0.y) + p2.x * (p0.y - p1.y)
      )
    );
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
