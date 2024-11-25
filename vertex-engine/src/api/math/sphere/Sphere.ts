import { Vector, vectorMag, vectorSub } from '../vector/Vector';

export class Sphere {
  constructor(private _position: Vector, private _radius: number) {}

  isIntersectingSphere(s: Sphere) {
    const d = vectorMag(vectorSub(s.position, this.position));
    return d < this.radius + s.radius;
  }

  get position() {
    return this._position;
  }

  set position(v: Vector) {
    this._position = v;
  }

  get radius() {
    return this._radius;
  }
}
