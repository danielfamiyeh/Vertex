import { Vector } from '../../math/vector/Vector';
import { Light } from '../light/Light';
import { Triangle } from '../triangle/Triangle';

export type GraphicsEngineOptions = {
  style?: 'fill' | 'stroke';
  camera?: {
    near: number;
    far: number;
    fieldOfView: number;
    position: Vector;
    displacement: number;
    direction: Vector;
    rotation: number;
  };
  lights?: Record<string, Light>;
  fps?: number;
  scale?: number;
};

export type RasterObject = {
  triangle: Triangle;
  worldNormal: Vector;
  centroid: Vector;
  activeTexture: string;
};
