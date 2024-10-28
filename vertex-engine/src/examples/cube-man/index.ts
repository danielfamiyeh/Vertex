import { GameEngine } from '../../api/game/engine/GameEngine';
import { CubeMan } from './CubeMan';

export const initCubeManExample = async (gameEngine: GameEngine) => {
  const cubeMan = await CubeMan(gameEngine);

  gameEngine.addToScene({ cubeMan });
  gameEngine.start();
};
