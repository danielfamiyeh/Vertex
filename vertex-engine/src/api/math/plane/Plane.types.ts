import { Vector } from '../../math/vector/Vector';

export type LinePlaneIntersection = {
  ray: Vector;
  t: number;
};

export type ClipMap = { inside: Array<Vector>; outside: Array<Vector> };
