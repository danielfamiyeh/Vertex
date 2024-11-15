import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { Vector } from '../../api/math/vector/Vector';

export const initShapes = async (gameEngine: GameEngine) => {
  const sphere = await gameEngine.createEntity('sphere', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
      scale: Vector.uniform(2, 3),
      style: 'stroke',
    },
    physics: {
      position: new Vector(0, 0, 5),
    },
  });

  const sphere2 = await gameEngine.createEntity('sphere', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
      scale: Vector.uniform(2, 3),
    },
    physics: {
      position: new Vector(-20, 0, 5),
    },
  });

  const sphere3 = await gameEngine.createEntity('sphere', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
      scale: Vector.uniform(2, 3),
    },
    physics: {
      position: new Vector(-10, 20, 5),
    },
  });

  const cube = await gameEngine.createEntity('cube', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: Vector.uniform(2, 3),
    },
    physics: {
      position: new Vector(-35, 0, 5),
    },
  });

  const cube2 = await gameEngine.createEntity('cube', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: Vector.uniform(2, 3),
      style: 'stroke',
    },
    physics: {
      position: new Vector(-35, -10, 5),
    },
  });

  const shapes = new Entity('shapes')
    .setRigidBody()
    .addChildren({ sphere, sphere2, sphere3, cube, cube2 });

  return { shapes };
};
