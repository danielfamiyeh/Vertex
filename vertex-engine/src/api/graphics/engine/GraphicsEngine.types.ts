import { Entity } from '../../game/entity/Entity';
import { Vector } from '../../math/vector/Vector';
import { Light } from '../light/Light';
import { Triangle } from '../triangle/Triangle';
import { Fragment } from '../shader';

export type GraphicsEngineOptions = {
  style?: 'fill' | 'stroke';
  pool?: {
    size?: number;
    maxSize?: number;
  };
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

export interface GraphicsPipelineStage {
  compute(
    triangleData: Entity | Fragment[] | RasterObject[],
    variables?: Record<string, any>
  ): any;
}
