import { Vector } from '../../math/vector/Vector';
import { RigidBodyTransform } from './RigidBody.types';

export type RigidBodyOptions = {
  id: string;
  position?: Vector;
  rotation?: Vector;
  mass?: number;
  forces?: Record<string, Vector>;
  transforms?: Record<string, RigidBodyTransform>;
  sphereRadius?: number;
};
