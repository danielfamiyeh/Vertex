import { Vector } from '../../../math/vector/Vector';

export type Fragment = {
  x: number;
  y: number;
  worldNormal: Vector;
  centroid: Vector;
  pixelColor: number[];
};
