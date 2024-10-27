import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { Vector } from '../../api/math/vector/Vector';

const limbRotation = 1.5;
const rotationLimit = 15;
const headRotationLimit = 30;

export const CubeMan = async (gameEngine: GameEngine) => {
  const head = await gameEngine.createEntity('head', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
    },

    physics: {
      position: new Vector(0, 20, -5),
      forces: {
        rotation: new Vector(0, limbRotation, 0),
      },
    },
  });

  const torso = await gameEngine.createEntity('torso', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(2, 5, 1),
    },
    physics: {
      position: new Vector(0, 13, -5),
    },
  });

  const rightArm = await gameEngine.createEntity('rightArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(3.5, 16, -5),
      forces: {
        rotation: new Vector(limbRotation, 0, 0),
      },
    },
  });

  const leftArm = await gameEngine.createEntity('leftArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-3.5, 16, -5),
      forces: { rotation: new Vector(-limbRotation, 0, 0) },
    },
  });

  const rightLeg = await gameEngine.createEntity('rightLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(1.1, 5.5, -5),
      forces: {
        rotation: new Vector(limbRotation, 0, 0),
      },
    },
  });

  const leftLeg = await gameEngine.createEntity('leftLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(-1, 2, 1),
    },

    physics: {
      position: new Vector(-1.1, 5.5, -5),
      forces: {
        rotation: new Vector(-limbRotation, 0, 0),
      },
    },
  });

  const cubeMan = new Entity('cubeMan').setRigidBody();
  const legs = new Entity('legs').setRigidBody();
  const arms = new Entity('arms').setRigidBody();

  arms.addChildren({ rightArm, leftArm });
  legs.addChildren({ rightLeg, leftLeg });
  cubeMan.addChildren({ head, torso, legs, arms });

  arms.body?.addTransform('rotate', (_, self) => {
    if (self.rotation.x >= rotationLimit || self.rotation.x <= -rotationLimit)
      self.forces.rotation.scale(-1);

    self.forces.rotation && self.rotation.add(self.forces.rotation);
  });

  legs.body?.addTransform('rotate', (_, self) => {
    if (self.rotation.x >= rotationLimit || self.rotation.x <= -rotationLimit)
      self.forces.rotation.scale(-1);

    self.forces.rotation && self.rotation.add(self.forces.rotation);
  });

  head.body?.addTransform('rotation', (_, self) => {
    if (
      self.rotation.y >= headRotationLimit ||
      self.rotation.y <= -headRotationLimit
    )
      self.forces.rotation.scale(-1);

    self.forces.rotation && self.rotation.add(self.forces.rotation);
  });

  cubeMan.body?.addForce('velocity', new Vector(0, 0, 0.1), false);

  cubeMan.body?.addTransform('move', (_, self) => {
    cubeMan.body?.forces.velocity &&
      self.position.add(cubeMan.body?.forces.velocity);
  });

  return cubeMan;
};
