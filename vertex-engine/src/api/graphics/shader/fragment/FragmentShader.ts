import { Vector } from '../../../math/vector/Vector';
import { Light } from '../../light/Light';
import { Fragment } from './FragmentShader.types';
import { Pool } from '../../../util/pool/Pool';

export class FragmentShader {
  constructor() {}

  static illuminate(
    fragment: Fragment,
    lights: Light[],
    vectorPool: Pool<Vector>
  ) {
    const { centroid, worldNormal, pixelColor } = fragment;

    lights.forEach((light) => {
      const normal = vectorPool.get();
      normal.x = worldNormal.x;
      normal.y = worldNormal.y;
      normal.z = worldNormal.z;

      const color = light.illuminate(normal, centroid);
      color.comps.forEach((val, i) => (pixelColor[i] += val));

      vectorPool.free(normal);
    });

    for (let i = 0; i < pixelColor.length; i++) {
      pixelColor[i] = Math.min(pixelColor[i], 255);
    }

    return fragment;
  }

  static compute(
    fragments: Fragment[],
    lights: Light[],
    vectorPool: Pool<Vector>
  ) {
    fragments.forEach((fragment: Fragment) => {
      FragmentShader.illuminate(fragment, lights, vectorPool);
    });

    return fragments;
  }
}
