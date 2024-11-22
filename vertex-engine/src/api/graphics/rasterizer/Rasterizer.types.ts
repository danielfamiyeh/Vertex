import { Vector } from '../../math/vector/Vector';
import { Triangle } from '../triangle/Triangle';

export type RasterObject = {
  triangle: Triangle;
  worldNormal: Vector;
  centroid: Vector;
  activeTexture: string;
};
