import { Color } from '../color/Color';
import { Light } from './Light';
import { Vector } from '../../math/vector/Vector';

export class DirectionalLight extends Light {
  constructor(color: Color, private _direction: Vector) {
    super(color);
    this._direction.scale(-1).normalize();
    this._color = color.RGBToHSV();
  }

  override illuminate(normal: Vector) {
    const raySimilarity = this.direction.dot(normal);
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
