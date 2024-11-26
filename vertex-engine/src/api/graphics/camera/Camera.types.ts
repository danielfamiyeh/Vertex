import { RigidBody } from 'src/api/physics/rigid-body/RigidBody';
import { Plane } from '../../../api/math/plane/Plane';

export type CameraFrustrum = {
  near: Plane;
  far: Plane;
  left: Plane;
  right: Plane;
  top: Plane;
  bottom: Plane;
};

export type CameraOptions = {
  displacement: number;
  near: number;
  far: number;
  bottom: number;
  right: number;
  body: RigidBody;
};
