import { Entity } from '../../../game/entity/Entity';
import { Vector } from '../../../math/vector/Vector';
import { RasterObject } from '../../engine/GraphicsEngine.types';
import { Light } from '../../light/Light';
import { Fragment } from './FragmentShader.types';

export class FragmentShader {
  constructor() {}

  static illuminate(fragment: Fragment, lights: Light[]) {
    const { centroid, worldNormal, pixelColor } = fragment;

    lights.forEach((light) => {
      const color = light.illuminate(
        new Vector(worldNormal.x, worldNormal.y, worldNormal.z),
        centroid.copy()
      );
      color.comps.forEach((val, i) => (pixelColor[i] += val));
    });

    for (let i = 0; i < pixelColor.length; i++) {
      pixelColor[i] = Math.min(pixelColor[i], 255);
    }

    return fragment;
  }

  static compute(
    triangleData: Entity | Fragment[] | RasterObject[],
    variables: Record<string, any> = {}
  ) {
    (<Fragment[]>triangleData).forEach((fragment: Fragment) => {
      FragmentShader.illuminate(fragment, variables.lights);
    });

    return triangleData;
  }
}
