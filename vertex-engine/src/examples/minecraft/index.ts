import { Vector } from '../../api/math/vector/Vector';
import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { AmbientLight } from '../../api/graphics/light/AmbientLight';
import { DirectionalLight } from '../../api/graphics/light/DirectionalLight';
import { PointLight } from '../../api/graphics/light/PointLight';
import { Color } from '../../api/graphics/color/Color';

export const initMinecraftExample = async (gameEngine: GameEngine) => {
  const cube = await gameEngine.createEntity('cube', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/models/cube.obj',
      textures: [
        { key: 'cubeMain', url: 'http://127.0.0.1:8080/sprites/cube.png' },
      ],
      scale: Vector.uniform(5, 3),
      style: 'stroke',
    },
    physics: {
      position: new Vector(0, 5, 5),
      // rotation: new Vector(0, 90, 0),
    },
  });

  // const sphere2 = await gameEngine.createEntity('sphere', {
  //   graphics: {
  //     mesh: 'http://127.0.0.1:8080/models/sphere.obj',
  //     scale: Vector.uniform(2, 3),
  //   },
  //   physics: {
  //     position: new Vector(-20, 0, 5),
  //   },
  // });

  // const sphere3 = await gameEngine.createEntity('sphere', {
  //   graphics: {
  //     mesh: 'http://127.0.0.1:8080/models/sphere.obj',
  //     scale: Vector.uniform(2, 3),
  //   },
  //   physics: {
  //     position: new Vector(-10, 20, 5),
  //   },
  // });

  const shapes = new Entity('shapes').setRigidBody().addChildren({ cube });

  shapes.body?.addForce('rotation', new Vector(2, 1, 0));
  shapes.body?.addTransform('rotate', (_, self) =>
    self.rotation.add(self.forces.rotation)
  );

  gameEngine.graphics.lights.ambient = new AmbientLight(
    new Color([1, 0, 0], 'rgb')
  );

  // gameEngine.graphics.lights.directional = new DirectionalLight(
  //   new Color([0, 255, 0], 'rgb'),
  //   new Vector(1, 0, 0)
  // );

  // gameEngine.graphics.lights.point = new PointLight(
  //   new Vector(-10, 0, 0),
  //   new Color([255, 255, 255], 'rgb'),
  //   1,
  //   0.15
  // );

  // gameEngine.graphics.lights.directional2 = new DirectionalLight(
  //   new Color([0, 0, 255], 'rgb'),
  //   new Vector(-1, 0, 0)
  // );

  // gameEngine.graphics.lights.SpotLight = new SpotLight(
  //   new Color([0, 0, 255], 'rgb'),
  //   new Vector(50, 100, 0),
  //   new Vector(-1, 0, 0),
  //   1,
  //   20
  // );

  if (cube.mesh) cube.mesh.activeTexture = 'cubeMain';

  gameEngine.addToScene({ shapes });

  console.log({ gameEngine });
  gameEngine.start();
};
