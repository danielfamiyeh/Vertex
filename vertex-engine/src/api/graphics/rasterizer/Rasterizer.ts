import { Vector, vectorScale, vectorSub } from '../../math/vector/Vector';
import { printOne } from '../engine/GraphicsEngine';
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

    if (Math.abs(dydx) === Infinity) {
      const [minY, maxY] = [startPoint[1], endPoint[1]].sort((a, b) => a - b);
      for (let y = minY; y <= maxY; y++) {
        partialFragments.push({
          x: startPoint[0],
          y: -y,
          worldNormal,
          centroid,
          pixelColor,
        });
      }
    } else {
      const [minX, maxX] = [startPoint[0], endPoint[0]].sort((a, b) => a - b);
      for (let x = minX; x <= maxX; x++) {
        const y = Math.floor(startPoint[1] + dydx * (x - startPoint[0]));
        partialFragments.push({
          x: Math.floor(x),
          y: -y,
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
    textureImageData: ImageData,
    screenBounds: { width: number; height: number }
  ) {
    const buffer: Fragment[] = [];

    raster.forEach(({ triangle, worldNormal, centroid }, i) => {
      const {
        points: [p1, p2, p3],
      } = triangle;
      const [[x1, y1], [x2, y2], [x3, y3]] = [p1, p2, p3];
      const bounds = {
        xMin: Math.min(x1, x2, x3),
        xMax: Math.max(x1, x2, x3),
        yMin: Math.min(y1, y2, y3),
        yMax: Math.max(y1, y2, y3),
      };
      const edges = [
        { a: y2 - y1, b: x1 - x2, c: x2 * y1 - x1 * y2 },
        { a: y3 - y2, b: x2 - x3, c: x3 * y2 - x2 * y3 },
        { a: y1 - y3, b: x3 - x1, c: x1 * y3 - x3 * y1 },
      ];

      if (textureImageData) {
        bounds.xMin = Math.max(bounds.xMin, -(screenBounds.width / 2));
        bounds.yMin = Math.max(bounds.yMin, -(screenBounds.height / 2));
        bounds.yMax = Math.min(bounds.yMax, screenBounds.height / 2 - 1);
        bounds.xMax = Math.min(bounds.xMax, screenBounds.width / 2 - 1);

        for (let y = bounds.yMin; y <= bounds.yMax; y++) {
          for (let x = bounds.xMin; x <= bounds.xMax; x++) {
            const p = [x, y];

            const isInsideTriangle =
              edges[0].a * x + edges[0].b * y + edges[0].c > 0 &&
              edges[1].a * x + edges[1].b * y + edges[1].c > 0 &&
              edges[2].a * x + edges[2].b * y + edges[2].c > 0;

            if (isInsideTriangle) {
              const barycentricCoordinates = triangle.barycentricCoordinates(p);

              const uvInterpolated = triangle.texturePoints
                .map((tp, i) => vectorScale(tp, barycentricCoordinates[i]))
                .reduce(([u1, v1], [u2, v2]) => [u1 + u2, v1 + v2], [0, 0]);

              const texX = Math.floor(
                uvInterpolated[0] * textureImageData.width
              );
              const texY = Math.floor(
                (1 - uvInterpolated[1]) * textureImageData.height
              );

              const index = (texY * textureImageData.width + texX) * 4;
              const r = textureImageData.data[index];
              const g = textureImageData.data[index + 1];
              const b = textureImageData.data[index + 2];
              const a = textureImageData.data[index + 3];

              const fragment = {
                x: Math.floor(x),
                y: -Math.floor(y),
                pixelColor: [r, g, b, a],
                worldNormal,
                centroid,
              };

              buffer.push(fragment);
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
