import { initBallsExample } from './balls';
import { initCubeManExample } from './cube-man';
import { initLightingExample } from './lighting';
import { initTwoBodyProblemExample } from './two-body-problem';
import { initMinecraftExample } from './minecraft';

export const examples = {
  balls: initBallsExample,
  cubeMan: initCubeManExample,
  lighting: initLightingExample,
  twoBodyProblem: initTwoBodyProblemExample,
  minecraft: initMinecraftExample,
};
