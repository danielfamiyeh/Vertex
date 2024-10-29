import { Vector } from '../../api/math/vector/Vector';
import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { Light } from '../../api/graphics/light/Light';
import { DirectionalLight } from '../../api/graphics/light/DirectionalLight';
import { PointLight } from '../../api/graphics/light/PointLight';
import { Color } from '../../api/graphics/color/Color';

export const initLightingExample = async (gameEngine: GameEngine) => {
  const sphere = await gameEngine.createEntity('sphere', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/sphere.obj',
      scale: Vector.uniform(2, 3),
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

  gameEngine.graphics.lights.ambient = new Light(new Color([0, 0, 0], 'rgb'));

  // gameEngine.graphics.lights.directional = new DirectionalLight(
  //   new Color([0, 255, 0], 'rgb'),
  //   new Vector(1, 0, 0)
  // );

  gameEngine.graphics.lights.point = new PointLight(
    new Vector(-10, 0, 0),
    new Color([255, 255, 255], 'rgb'),
    0.15
  );

  // gameEngine.graphics.lights.directional2 = new DirectionalLight(
  //   'directional2',
  //   new Color([0, 0, 255], 'rgb'),
  //   new Vector(0, 1, 0)
  // );

  // gameEngine.graphics.lights.SpotLight = new SpotLight(
  //   new Color([0, 0, 255], 'rgb'),
  //   new Vector(3, 5, 3),
  //   new Vector(1, 0, 0),
  //   0.8
  // );

  gameEngine.addToScene({ allSpheres });
  gameEngine.graphics.style = 'fill';

  gameEngine.start();
};
