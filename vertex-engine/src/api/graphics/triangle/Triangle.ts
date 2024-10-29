import { Vector } from '../../math/vector/Vector';

export class Triangle {
  constructor(
    private _points: Vector[],
    private _zMidpoint: number,
    private _worldNormal: Vector,
    private _worldPoint: Vector,
    private _color: string
  ) {}

  get worldPoint() {
    return this._worldPoint;
  }

  get zMidpoint() {
    return this._zMidpoint;
  }

  get points() {
    return this._points;
  }

  get worldNormal() {
    return this._worldNormal;
  }

  get color() {
    return this._color;
  }

  set color(c: string) {
    this._color = c;
  }
}
