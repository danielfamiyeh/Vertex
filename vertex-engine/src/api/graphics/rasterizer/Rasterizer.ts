import {
  Vector,
  vectorAdd,
  vectorScale,
  vectorSub,
} from '../../math/vector/Vector';
import { getImageDataAtPixel } from './Rasterizer.utils';
import { RasterObject } from '../engine/GraphicsEngine.types';
import { Fragment } from '../shader';

export class Rasterizer {
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
      const _startPoint = endPoint[1] > startPoint[1] ? startPoint : endPoint;
      const _endPoint = startPoint === endPoint ? startPoint : endPoint;

      for (let y = _startPoint[1]; y <= _endPoint[1]; y++) {
        partialFragments.push({
          x: _startPoint[0],
          y: -y,
          worldNormal,
          centroid,
          pixelColor,
        });
      }
    } else {
      for (let x = startPoint[0]; x <= endPoint[0]; x++) {
        partialFragments.push({
          x: Math.floor(x),
          y: Math.floor(-(startPoint[1] + dydx * (x - startPoint[0]))),
          worldNormal,
          centroid,
          pixelColor,
        });
      }
    }

    return partialFragments;
  }

  static compute(
    raster: RasterObject[],
    textureDimensions: Record<string, { width: number; height: number }>,
    textureImageData: Record<string, ImageData>
  ) {
    const buffer: Fragment[] = [];

    raster.forEach(({ triangle, activeTexture, worldNormal, centroid }, i) => {
      const {
        points: [p1, p2, p3],
      } = triangle;

      if (triangle.hasTexture) {
        const [[x1, y1], [x2, y2], [x3, y3]] = [p1, p2, p3];
        const bounds = {
          xMin: Math.min(x1, x2, x3),
          xMax: Math.max(x1, x2, x3),
          yMin: Math.min(x1, y2, y3),
          yMax: Math.max(x1, y2, y3),
        };

        for (let x = bounds.xMin; x <= bounds.xMax; x++) {
          for (let y = bounds.yMin; y <= bounds.yMax; y++) {
            const p = [x, y];

            const barycentricCoordinates = triangle.barycentricCoordinates(p);
            const pointLiesInTriangle =
              Math.abs(barycentricCoordinates.reduce((a, b) => a + b, 0) - 1) <=
              1e-6;

            if (pointLiesInTriangle) {
              const originalTexturePoints = triangle.texturePoints.map(
                (tp, i) => {
                  const _tp = [...tp];
                  vectorScale(
                    triangle.texturePoints[i],
                    barycentricCoordinates[i]
                  );
                  return _tp;
                }
              );

              const uvInterpolated = vectorAdd(
                vectorAdd(triangle.texturePoints[0], triangle.texturePoints[1]),
                triangle.texturePoints[2]
              );

              const fragment = {
                x: Math.floor(x),
                y: -Math.floor(y),
                pixelColor: getImageDataAtPixel(
                  // Technically the job of a fragment shader (I think?)
                  // But may as well do this here to save interpolating again
                  Math.floor(
                    uvInterpolated[0] * textureDimensions[activeTexture].width
                  ),
                  Math.floor(
                    (1 - uvInterpolated[1]) *
                      textureDimensions[activeTexture].height
                  ),
                  textureImageData[activeTexture]
                ),
                worldNormal,
                centroid,
              };

              buffer.push(fragment);

              triangle.texturePoints.forEach(
                (tp, i) => (tp = originalTexturePoints[i])
              );
            }
          }
        }
      } else {
        const points = [p1, p2, p3].sort((a, b) => a[0] - b[0]);

        const v = vectorSub(points[1], points[0]);
        const v2 = vectorSub(points[2], points[1]);
        const v3 = vectorSub(points[2], points[0]);

        const dydx1 = v[1] / v[0];
        const dydx2 = v2[1] / v2[0];
        const dydx3 = v3[1] / v3[0];

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
