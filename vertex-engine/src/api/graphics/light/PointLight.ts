import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';
import { Light } from './Light';

export class PointLight extends Light {
  constructor(
    color: Color,
    private _position: Vector,
    private _direction: Vector,
    private _intensity = 1
  ) {
    super(color);
    this._direction.normalize();
    this._color.RGBToHSV();

    if (_intensity < 0 || _intensity > 1) {
      throw new Error(
        'PointLight intensity must be a value in the range [0, 1]'
      );
    }
  }

  override illuminate(normal: Vector) {
    const isInViewOfLight =
      Vector.sub(this.position, normal).normalize().dot(normal) > 0;

    if (!isInViewOfLight) return new Color([0, 0, 0], 'rgb');

    const brightness = Math.abs(this.direction.dot(normal) * this._intensity);
    const comps = [...this.color.comps];
    comps[2] = brightness;

    return new Color(comps, 'hsv').HSVtoRGB();
  }

  get position() {
    return this._position;
  }

  get direction() {
    return this._direction;
  }
}
