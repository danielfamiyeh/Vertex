import { Vector } from '../../math/vector/Vector';
import { printOne } from '../engine/GraphicsEngine';
import {
  GraphicsPipelineStage,
  RasterObject,
} from '../engine/GraphicsEngine.types';
import { Light } from '../light/Light';
import { Triangle } from '../triangle/Triangle';
import { Fragment } from './FragmentShader.types';

export class FragmentShader implements GraphicsPipelineStage {
  constructor(private _lights: Record<string, Light>) {}

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
      // pixelColor[i] = Math.min(pixelColor[i], 255);
    }

    return fragment;
  }

  static drawPixel(fragment: Fragment, ctx: CanvasRenderingContext2D) {
    const {
      x,
      y,
      pixelColor: [r, g, b],
    } = fragment;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    ctx.fillRect(x, y, 1, 1);
  }

  compute(
    triangleData: any,
    variables: Record<string, any> = {}
  ): (RasterObject | Triangle)[] | null {
    triangleData.forEach((fragment: Fragment) => {
      FragmentShader.illuminate(fragment, variables.lights);
    });
    return triangleData;
  }
}
