import { Light } from './Light';
import { Color } from '../color/Color';
import {
  Vector,
  vectorDiv,
  vectorDot,
  vectorNormalize,
  vectorScale,
} from '../../math/vector/Vector';

export class DirectionalLight implements Light {
  constructor(private _color: Color, private _direction: Vector) {
    vectorNormalize(vectorScale(this._direction, -1));
    this._color = this._color.RGBToHSV();
  }

  illuminate(normal: Vector) {
    const raySimilarity = vectorDot(this._direction, normal);
    const brightness = Math.max(0.25, raySimilarity);

    const comps = [...this.color.comps];
    comps[2] = brightness;

    return new Color(comps, 'hsv').HSVtoRGB();
  }

  get color() {
    return this._color;
  }

  get direction() {
    return this._direction;
  }
}
