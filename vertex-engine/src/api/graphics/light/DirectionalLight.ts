import { Color } from '../color/Color';
import { Light } from './Light';
import { Vector } from '../../math/vector/Vector';

export class DirectionalLight extends Light {
  constructor(id: string, color: Color, private _direction: Vector) {
    super(id, color);
    this._direction.scale(-1).normalize();
    this._color = color.RGBToHSV();
  }

  override illuminate(normal: Vector): { color: Color; raySimilarity: number } {
    const raySimilarity = this.direction.dot(normal);
    const brightness = Math.max(0.25, raySimilarity);

    this.color.comps[2] = brightness;

    return { raySimilarity, color: this.color.HSVtoRGB() };
  }

  get color() {
    return this._color;
  }

  get direction() {
    return this._direction;
  }
}
