import { Vector } from '../../api/math/vector/Vector';
import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { AmbientLight } from '../../api/graphics/light/AmbientLight';
import { DirectionalLight } from '../../api/graphics/light/DirectionalLight';
import { PointLight } from '../../api/graphics/light/PointLight';
import { SpotLight } from '../../api/graphics/light/SpotLight';
import { Color } from '../../api/graphics/color/Color';

export const initLightingExample = async (gameEngine: GameEngine) => {
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

  const allSpheres = new Entity('allSpheres')
    .setRigidBody()
    .addChildren({ sphere, sphere2, sphere3 });

  allSpheres.body?.addForce('rotation', new Vector(0, 2, 0));
  allSpheres.body?.addTransform('rotate', (_, self) =>
    self.rotation.add(self.forces.rotation)
  );

  gameEngine.graphics.lights.ambient = new AmbientLight(
    new Color([128, 0, 0], 'rgb')
  );

  gameEngine.graphics.lights.directional = new DirectionalLight(
    new Color([0, 255, 0], 'rgb'),
    new Vector(1, 0, 0)
  );

  gameEngine.graphics.lights.point = new PointLight(
    new Vector(-10, 0, 0),
    new Color([255, 255, 255], 'rgb'),
    1,
    0.15
  );

  gameEngine.graphics.lights.directional2 = new DirectionalLight(
    new Color([0, 0, 255], 'rgb'),
    new Vector(-1, 0, 0)
  );

  // gameEngine.graphics.lights.SpotLight = new SpotLight(
  //   new Color([0, 0, 255], 'rgb'),
  //   new Vector(50, 100, 0),
  //   new Vector(-1, 0, 0),
  //   1,
  //   20
  // );

  gameEngine.addToScene({ allSpheres });

  gameEngine.start();
};
