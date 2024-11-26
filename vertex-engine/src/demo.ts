import { GameEngine } from './api/game/engine/GameEngine';
import { initMinecraftExample } from './examples/minecraft';

const gameEngine = new GameEngine({
  graphics: {
    fps: 30,
    style: 'stroke',
    camera: {
      near: 0.1,
      far: 1000,
      fieldOfView: 45,
      position: [0, 10, -30],
      direction: [0, 0, 1],
      displacement: 1,
      rotation: 1e-2,
    },
  },
  physics: {},
});

initMinecraftExample(gameEngine);
