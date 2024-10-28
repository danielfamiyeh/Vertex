import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';

export class Light {
  constructor(protected _color: Color) {}

  illuminate(_normal: Vector) {
    return this._color;
  }

  get color() {
    return this._color;
  }
}
