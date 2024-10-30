import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';
import { Light } from './Light';

export class SpotLight implements Light {
  private _minRaySimilarity: number;

  constructor(
    private _color: Color,
    private _position: Vector,
    private _direction: Vector,
    private _intensity = 1,
    private _theta = 45
  ) {
    if (_intensity < 0 || _intensity > 1) {
      throw new Error(
        'SpotLight intensity must be a value in the range [0, 1]'
      );
    }

    if (_theta < 0 || _theta > 90) {
      throw new Error('SpotLight theta must be a value in the range [0, 90]');
    }

    this._direction.normalize();
    this._color = this._color.RGBToHSV();
    this._minRaySimilarity = Math.abs((90 - _theta) / 90);
  }

  illuminate(normal: Vector, point: Vector) {
    const distanceVec = Vector.sub(this._position, point);
    const raySimilarity = Vector.normalize(distanceVec).dot(normal);
    const distance = distanceVec.mag;

    if (!(raySimilarity >= this._minRaySimilarity))
      return new Color([0, 0, 0], 'rgb');

    const comps = [...this._color.comps];

    return new Color(comps, 'hsv').HSVtoRGB();
  }

  get position() {
    return this._position;
  }

  get direction() {
    return this._direction;
  }
}
