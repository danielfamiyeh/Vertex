import { Color } from '../color/Color';
import { Light } from './Light';

export class AmbientLight implements Light {
  constructor(protected _color: Color) {}

  illuminate() {
    return this._color;
  }

  get color() {
    return this._color;
  }
}
