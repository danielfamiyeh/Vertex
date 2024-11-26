import { RigidBody } from 'src/api/physics/rigid-body/RigidBody';

export type CameraOptions = {
  displacement: number;
  near: number;
  far: number;
  body: RigidBody;
};
