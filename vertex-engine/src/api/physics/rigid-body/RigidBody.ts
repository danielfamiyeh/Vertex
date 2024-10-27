import { Vector } from '../../math/vector/Vector';
import { RigidBodyOptions } from './RigidBody.utils';
import { Entity } from '../../game/entity/Entity';
import { RigidBodyTransform } from './RigidBody.types';
import { Sphere } from '../../math/sphere/Sphere';

export class RigidBody {
  private _id: string;
  private _position: Vector;
  private _rotation: Vector;
  private _mass: number;
  private _transforms: Record<string, RigidBodyTransform>;
  private _forces: Record<string, Vector> = {};
  private _boundingSphere: Sphere;

  constructor(options: RigidBodyOptions) {
    this._id = options.id;
    this._position = options.position ?? Vector.zeroes(3);
    this._rotation = options.rotation ?? Vector.zeroes(3);
    this._mass = options.mass ?? 1;
    this._forces = options.forces ?? {};
    this._transforms = options.transforms ?? {};
    this._boundingSphere = new Sphere(
      this._position,
      options.sphereRadius ?? 0
    );
  }

  update(dTime: number, entities: Record<string, Entity>) {
    const { transforms } = this;

    Object.keys(transforms).forEach((id) => {
      transforms[id].bind(this)(dTime, this, entities);
    });
  }

  // addForce(id: string, force: Vector, entity?: Entity) {

  // }

  addTransform(id: string, transform: RigidBodyTransform, entity?: Entity) {
    if (entity) {
      console.log(entity);
      Object.keys(entity.children).forEach((childId) => {
        const childEntity = entity.children[childId];

        console.log(childEntity);
        childEntity.body?.addTransform(id, transform, childEntity);
      });
    }

    this._transforms[id] = transform;
  }

  get id() {
    return this._id;
  }

  get position() {
    return this._position;
  }

  get rotation() {
    return this._rotation;
  }

  get mass() {
    return this._mass;
  }

  get transforms() {
    return this._transforms;
  }

  get forces() {
    return this._forces;
  }

  get boundingSphere() {
    return this._boundingSphere;
  }

  set boundingSphere(s: Sphere) {
    this._boundingSphere = s;
  }
}
