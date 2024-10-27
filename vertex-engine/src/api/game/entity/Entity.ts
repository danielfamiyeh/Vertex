import { Mesh } from '@vertex/api/graphics/mesh/Mesh';
import { Vector } from '@vertex/api/math/vector/Vector';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { Collider } from '../../physics/collider/Collider';
import { RigidBodyOptions } from '@vertex/api/physics/rigid-body/RigidBody.utils';

export class Entity {
  public mesh?: Mesh;
  public scale?: Vector;
  public body?: RigidBody;
  public colliders: Record<string, Collider> = {};
  public children: Record<string, Entity> = {};

  constructor(private readonly _id: string) {}

  get id() {
    return this._id;
  }

  addChildren(childrenMap: Record<string, Entity>) {
    Object.assign(this.children, childrenMap);
    return this;
  }

  setRigidBody(body?: RigidBodyOptions) {
    this.body = new RigidBody({ parentEntity: this, ...body });
    return this;
  }
}
