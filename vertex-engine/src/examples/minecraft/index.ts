import { vectorAdd, vectorUniform } from '../../api/math/vector/Vector';
import { GameEngine } from '../../api/game/engine/GameEngine';
import { AmbientLight } from '../../api/graphics/light/AmbientLight';
import { Color } from '../../api/graphics/color/Color';
import { DirectionalLight } from '../../api/graphics/light/DirectionalLight';

export const initMinecraftExample = async (gameEngine: GameEngine) => {
  const cube = await gameEngine.createEntity('cube', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/models/cube.obj',
      textures: [
        { key: 'cubeMain', url: 'http://127.0.0.1:8080/sprites/cube.png' },
      ],
      scale: vectorUniform(5, 3),
      style: 'stroke',
    },
    physics: {
      position: [-10, 5, -15],
      direction: [20, 30, 0],
    },
  });

  // const sphere2 = await gameEngine.createEntity('sphere', {
  //   graphics: {
  //     mesh: 'http://127.0.0.1:8080/models/sphere.obj',
  //     scale: vectorUniform(2, 3),
  //   },
  //   physics: {
  //     position: [-20, 0, 5],
  //     direction: [0, 0, 0],
  //   },
  // });

  // const sphere3 = await gameEngine.createEntity('sphere', {
  //   graphics: {
  //     mesh: 'http://127.0.0.1:8080/models/sphere.obj',
  //     scale: Vector.uniform(2, 3),
  //   },
  //   physics: {
  //     position: [-10, 20,]5),
  //   },
  // });

  // const shapes = new Entity('shapes')
  //   .setRigidBody()
  //   .addChildren({ cube, sphere2 });

  gameEngine.graphics.lights.ambient = new AmbientLight(
    new Color([1, 0, 0], 'rgb')
  );

  // gameEngine.graphics.lights.directional = new DirectionalLight(
  //   new Color([0, 255, 0], 'rgb'),
  //   [1, 0, 0]
  // );

  // gameEngine.graphics.lights.point = new PointLight(
  //   [-10, 0,]0),
  //   new Color([255, 255, 255], 'rgb'),
  //   1,
  //   0.15
  // );

  // gameEngine.graphics.lights.directional2 = new DirectionalLight(
  //   new Color([0, 0, 255], 'rgb'),
  //   [-1, 0,]0)
  // );

  // gameEngine.graphics.lights.SpotLight = new SpotLight(
  //   new Color([0, 0, 255], 'rgb'),
  //   [50, 100, 0],
  //   [-1, 0,]0),
  //   1,
  //   20
  // );

  // if (cube.mesh) cube.mesh.activeTexture = 'cubeMain';

  // gameEngine.addToScene({ shapes });

  const castle = await gameEngine.createEntity('castle', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/models/peaches-castle/Peaches Castle.obj',
    },
    physics: {
      position: [0, 0, 0],
    },
  });

  cube.body?.addForce('rotation', [0, 0.25, 0]);
  cube.body?.addTransform('rotate', (_, self) => {
    self.direction = vectorAdd(self.direction, self.forces.rotation);
  });

  if (cube.mesh) cube.mesh.activeTexture = 'cubeMain';
  gameEngine.addToScene({ cube, castle });

  console.log(castle);
  console.log({ gameEngine });
  gameEngine.start();
};
