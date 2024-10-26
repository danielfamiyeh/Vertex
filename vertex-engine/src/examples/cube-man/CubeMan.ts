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
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const torso = await gameEngine.createEntity('torso', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(2, 5, 1),
    },
    physics: {
      position: new Vector(0, 13, -5),
      rotation: new Vector(0, 0, 0),
    },
  });

  const rightUpperArm = await gameEngine.createEntity('rightUpperArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(3.5, 16, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const leftUpperArm = await gameEngine.createEntity('leftUpperArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-3.5, 16, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const leftLowerArm = await gameEngine.createEntity('leftLowerArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(3.5, 12, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const rightLowerArm = await gameEngine.createEntity('rightLowerArm', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-3.5, 12, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const rightUpperLeg = await gameEngine.createEntity('rightUpperLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(1, 6, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const leftUpperLeg = await gameEngine.createEntity('leftUpperLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-1, 6, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const rightLowerLeg = await gameEngine.createEntity('rightLowerLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(-1, 2, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const leftLowerLeg = await gameEngine.createEntity('leftLowerLeg', {
    graphics: {
      mesh: 'http://127.0.0.1:8080/cube.obj',
      scale: new Vector(1, 2, 1),
    },

    physics: {
      position: new Vector(1, 2, -5),
      rotation: new Vector(0, 2, 0),

      forces: {
        velocity: new Vector(0, 0, 0),
      },

      transforms: {},
    },
  });

  const cubeMan = new Entity('cubeMan');

  cubeMan.children.head = head;
  cubeMan.children.torso = torso;
  cubeMan.children.torso.children.rightArm = new Entity('rightArm');
  cubeMan.children.torso.children.leftArm = new Entity('leftArm');

  cubeMan.children.legs = new Entity('legs');
  cubeMan.children.legs.children.rightLeg = new Entity('rightLeg');
  cubeMan.children.legs.children.leftLeg = new Entity('leftLeg');

  cubeMan.children.torso.children.rightArm.children.upperArm = rightUpperArm;
  cubeMan.children.torso.children.rightArm.children.lowerArm = rightLowerArm;

  cubeMan.children.torso.children.leftArm.children.upperArm = leftUpperArm;
  cubeMan.children.torso.children.leftArm.children.lowerArm = leftLowerArm;

  cubeMan.children.legs.children.rightLeg.children.upperLeg = rightUpperLeg;
  cubeMan.children.legs.children.rightLeg.children.lowerLeg = rightLowerLeg;

  cubeMan.children.legs.children.leftLeg.children.upperLeg = leftUpperLeg;
  cubeMan.children.legs.children.leftLeg.children.lowerrLeg = leftLowerLeg;

  return cubeMan;
};
