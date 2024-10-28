import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';

export class Light {
  constructor(protected _id: string, protected _color: Color) {}

  illuminate(normal: Vector) {
    return { color: this._color, raySimilarity: 1 };
  }

  get id() {
    return this._id;
  }

  get color() {
    return this._color;
  }
}
