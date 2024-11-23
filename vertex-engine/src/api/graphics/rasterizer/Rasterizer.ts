import { Vector } from '../../math/vector/Vector';
import { getImageDataAtPixel } from './Rasterizer.utils';
import {
  GraphicsPipelineStage,
  RasterObject,
} from '../engine/GraphicsEngine.types';
import { Fragment } from '../shader';
import { printOne } from '../engine/GraphicsEngine';

export class Rasterizer implements GraphicsPipelineStage {
  constructor(
    private _textures: Record<string, HTMLImageElement>,
    private _textureImageData: Record<string, ImageData>
  ) {}

  static getPartialFragments(
    startPoint: Vector,
    endPoint: Vector,
    dydx: number,
    worldNormal: Vector,
    centroid: Vector,
    pixelColor: number[]
  ) {
    const partialFragments: Fragment[] = [];

    if (dydx === Infinity) {
      const _startPoint = endPoint.y > startPoint.y ? startPoint : endPoint;
      const _endPoint = startPoint === endPoint ? startPoint : endPoint;

      for (let y = _startPoint.y; y <= _endPoint.y; y++) {
        partialFragments.push({
          x: _startPoint.x,
          y: -y,
          worldNormal,
          centroid,
          pixelColor,
        });
      }
    } else {
      for (let x = startPoint.x; x <= endPoint.x; x++) {
        partialFragments.push({
          x,
          y: -(startPoint.y + dydx * (x - startPoint.x)),
          worldNormal,
          centroid,
          pixelColor,
        });
      }
    }

    return partialFragments;
  }

  compute(raster: RasterObject[]) {
    const buffer: Fragment[] = [];

    raster.forEach(({ triangle, activeTexture, worldNormal, centroid }) => {
      const {
        points: [p1, p2, p3],
        color,
        style,
      } = triangle;

      if (triangle.hasTexture) {
        const texture = this._textures[activeTexture];

        const bounds = {
          xMin: Math.min(p1.x, p2.x, p3.x),
          xMax: Math.max(p1.x, p2.x, p3.x),
          yMin: Math.min(p1.y, p2.y, p3.y),
          yMax: Math.max(p1.y, p2.y, p3.y),
        };

        for (let x = bounds.xMin; x <= bounds.xMax; x++) {
          for (let y = bounds.yMin; y <= bounds.yMax; y++) {
            const barycentricCoordinates = triangle.barycentricCoordinates(
              new Vector(x, y)
            );
            const pointLiesInTriangle =
              Math.abs(barycentricCoordinates.reduce((a, b) => a + b, 0) - 1) <=
              1e-6;

            if (pointLiesInTriangle) {
              const originalTexturePoints = triangle.texturePoints.map((tp) => [
                ...tp.comps,
              ]);
              const uvInterpolated = triangle.texturePoints[0]
                .scale(barycentricCoordinates[0])
                .add(
                  triangle.texturePoints[1].scale(barycentricCoordinates[1]),
                  triangle.texturePoints[2].scale(barycentricCoordinates[2])
                );

              const fragment = {
                x: Math.floor(x),
                y: -Math.floor(y),
                pixelColor: getImageDataAtPixel(
                  // Technically the job of a fragment shader (I think?)
                  // But may as well do this here to save interpolating again
                  Math.floor(uvInterpolated.x * texture.naturalWidth),
                  Math.floor((1 - uvInterpolated.y) * texture.naturalHeight),
                  this._textureImageData[activeTexture]
                ),
                worldNormal,
                centroid,
              };

              buffer.push(fragment);

              triangle.texturePoints.forEach(
                (tp, i) => (tp.comps = originalTexturePoints[i])
              );
            }
          }
        }
      } else {
        const points = [p1, p2, p3].sort((a, b) => a.x - b.x);
        const v = Vector.sub(points[1], points[0]);
        const v2 = Vector.sub(points[2], points[1]);
        const v3 = Vector.sub(points[2], points[0]);

        const dydx1 = v.y / v.x;
        const dydx2 = v2.y / v2.x;
        const dydx3 = v3.y / v3.x;

        const partialFragments1 = Rasterizer.getPartialFragments(
          points[0],
          points[1],
          dydx1,
          worldNormal,
          centroid,
          [255, 255, 255]
        );

        const partialFragments2 = Rasterizer.getPartialFragments(
          points[1],
          points[2],
          dydx2,
          worldNormal,
          centroid,
          [255, 255, 255]
        );

        const partialFragments3 = Rasterizer.getPartialFragments(
          points[0],
          points[2],
          dydx3,
          worldNormal,
          centroid,
          [255, 255, 255]
        );

        for (let i = 0; i < partialFragments1.length; i++) {
          buffer.push(partialFragments1[i]);
        }
        for (let i = 0; i < partialFragments2.length; i++) {
          buffer.push(partialFragments2[i]);
        }
        for (let i = 0; i < partialFragments3.length; i++) {
          buffer.push(partialFragments3[i]);
        }
      }
    });

    return buffer;
  }
}
