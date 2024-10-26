import { Entity } from '@vertex/api/game/entity/Entity';

export class PhysicsEngine {
  constructor() {}

  update(delta: number, entities: Record<string, Entity>) {
    // TODO: Apply parent transformations to children
    const queue: Entity[] = [];

    Object.keys(entities).forEach((id) => {
      const entity = entities[id];
      if (Object.keys(entity.children).length) {
        queue.push(entity);
        this.update(delta, entity.children);
      }
      queue.pop();

      const colliders = Object.keys(entity.colliders)
        .filter((id) => entity.colliders[id].isActive)
        .map((id) => entity.colliders[id]);

      entity.body?.update(delta, entities);

      colliders.forEach((collider) => {
        collider.handleCollision();
      });
    });
  }
}
