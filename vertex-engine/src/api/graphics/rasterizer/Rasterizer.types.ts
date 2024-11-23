import { Vector } from '../../math/vector/Vector';
import { Triangle } from '../triangle/Triangle';

export type PreFragment = {
  triangle: Triangle;
  worldNormal: Vector;
  centroid: Vector;
  activeTexture: string;
};
