import { Vector } from '../../api/math/vector/Vector';
import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { Light } from '../../api/graphics/light/Light';
import { DirectionalLight } from '../../api/graphics/light/DirectionalLight';
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

  const allSpheres = new Entity('allSpheres')
    .setRigidBody()
    .addChildren({ sphere });

  allSpheres.body?.addForce('rotation', new Vector(0, 2, 0));
  allSpheres.body?.addTransform('rotate', (_, self) =>
    self.rotation.add(self.forces.rotation)
  );

  gameEngine.graphics.lights.ambient = new Light(
    'ambient',
    new Color([255, 0, 0], 'rgb')
  );

  gameEngine.graphics.lights.directional = new DirectionalLight(
    'directional',
    new Color([0, 255, 0], 'rgb'),
    new Vector(1, 0, 0)
  );

  gameEngine.graphics.lights.directional2 = new DirectionalLight(
    'directional2',
    new Color([0, 0, 255], 'rgb'),
    new Vector(0, 1, 0)
  );

  gameEngine.addToScene({ sphere });
  gameEngine.graphics.style = 'fill';

  gameEngine.start();
};
