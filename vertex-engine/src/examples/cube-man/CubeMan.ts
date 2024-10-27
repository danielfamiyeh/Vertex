import { GameEngine } from '../../api/game/engine/GameEngine';
import { Entity } from '../../api/game/entity/Entity';
import { Vector } from '../../api/math/vector/Vector';

export const CubeMan = async (gameEngine: GameEngine) => {
  const head = await gameEngine.createEntity('head', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
    },

    physics: {
      position: new Vector(0, 20, -5),
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

  const rightUpperArm = await gameEngine.createEntity('rightUpperArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(3.5, 16, -5),
    },
  });

  const leftUpperArm = await gameEngine.createEntity('leftUpperArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-3.5, 16, -5),
    },
  });

  const leftLowerArm = await gameEngine.createEntity('leftLowerArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-3.5, 12, -5),
    },
  });

  const rightLowerArm = await gameEngine.createEntity('rightLowerArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(3.5, 12, -5),
    },
  });

  const rightUpperLeg = await gameEngine.createEntity('rightUpperLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(1, 6, -5),
    },
  });

  const leftUpperLeg = await gameEngine.createEntity('leftUpperLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(-1, 2, 1),
    },

    physics: {
      position: new Vector(-1, 6, -5),
    },
  });

  const rightLowerLeg = await gameEngine.createEntity('rightLowerLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(1, 2, -5),
    },
  });

  const leftLowerLeg = await gameEngine.createEntity('leftLowerLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-1, 2, -5),
    },
  });

  const cubeMan = new Entity('cubeMan').setRigidBody();
  const rightArm = new Entity('rightArm').setRigidBody();
  const leftArm = new Entity('leftArm').setRigidBody();
  const legs = new Entity('legs').setRigidBody();
  const rightLeg = new Entity('rightLeg').setRigidBody();
  const leftLeg = new Entity('leftLeg').setRigidBody();

  cubeMan.addChildren({ head, torso, legs });
  torso.addChildren({ rightArm, leftArm });
  rightArm.addChildren({ rightUpperArm, rightLowerArm });
  leftArm.addChildren({ leftUpperArm, leftLowerArm });
  legs.addChildren({ rightLeg, leftLeg });
  rightLeg.addChildren({ rightUpperLeg, rightLowerLeg });
  leftLeg.addChildren({ leftUpperLeg, leftLowerLeg });

  cubeMan.body?.addForce('velocity', new Vector(0, 0, 0.1));
  cubeMan.body?.addTransform('move', (_, self) => {
    self.position.add(self.forces.velocity);
  });

  return cubeMan;
};
