import { Vector } from '../../math/vector/Vector';
import { MeshStyle } from '../mesh/Mesh';

export class Triangle {
  constructor(
    private _points: Vector[],
    private _color: string,
    private _style: MeshStyle,
    private _texturePoints: Vector[] = []
  ) {}

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
