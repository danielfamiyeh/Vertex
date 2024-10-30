import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';
import { Light } from './Light';

export class PointLight implements Light {
  constructor(
    private _position: Vector,
    private _color: Color,
    private _intensity: number = 1,
    private _attenuation: number = 0
  ) {
    this._color = this._color.RGBToHSV();
  }

  illuminate(normal: Vector, point: Vector): Color {
    const distanceVec = Vector.sub(this._position, point);
    const raySimilarity = Vector.normalize(distanceVec).dot(normal);
    const distance = distanceVec.mag;

    if (raySimilarity <= 0) return new Color([0, 0, 0], 'rgb');

    const comps = [...this._color.comps];
    comps[2] = Math.max(
      0,
      (raySimilarity * (this._intensity || 1)) /
        (distance * this.attentuation || 1) || 1
    );

    return new Color(comps, 'hsv').HSVtoRGB();
  }

  get intensity() {
    return this._intensity;
  }

  get attentuation() {
    return this._attenuation;
  }

  get position() {
    return this._position;
  }
}
