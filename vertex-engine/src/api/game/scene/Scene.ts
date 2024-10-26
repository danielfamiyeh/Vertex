import { Entity } from '../entity/Entity';

export class Scene {
  private _entities: Record<string, Entity> = {};
  private _root: Entity;

  constructor() {
    this._root = new Entity('scene');
  }

  get root() {
    return this._root;
  }

  get entities() {
    return this._entities;
  }
}
