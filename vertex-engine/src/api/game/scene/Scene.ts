import { Entity } from '../entity/Entity';

export class Scene {
  private _root: Entity;

  constructor() {
    this._root = new Entity('scene');
  }

  get root() {
    return this._root;
  }
}
