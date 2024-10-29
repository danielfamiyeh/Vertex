import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';
import { Light } from './Light';

export class PointLight extends Light {
  constructor(
    private _position: Vector,
    color: Color,
    private _attenuation: number = 0
  ) {
    super(color);
    this._color = this._color.RGBToHSV();
  }

  override illuminate(normal: Vector, point: Vector): Color {
    const distanceVec = Vector.sub(this._position, point);
    const raySimilarity = Vector.normalize(distanceVec).dot(normal);
    const distance = distanceVec.mag;

    if (raySimilarity <= 0) return new Color([0, 0, 0], 'rgb');

    const comps = [...this._color.comps];
    comps[2] = Math.max(
      0,
      raySimilarity / (distance * this.attentuation || 1) || 1
    );

    return new Color(comps, 'hsv').HSVtoRGB();
  }

  get attentuation() {
    return this._attenuation;
  }

  get position() {
    return this._position;
  }
}
