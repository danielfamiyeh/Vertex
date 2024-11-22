import { Vector } from '../../math/vector/Vector';
import { RasterObject } from './Rasterizer.types';
import { getImageDataAtPixel } from './Rasterizer.utils';
import { GraphicsPipelineStage } from '../engine/GraphicsEngine.types';
import { printOne } from '../engine/GraphicsEngine';
import { Fragment } from '../shader';

export class Rasterizer implements GraphicsPipelineStage {
  constructor(
    private _textures: Record<string, HTMLImageElement>,
    private _textureImageData: Record<string, ImageData>
  ) {}

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

              buffer.push({
                x: Math.floor(x),
                y: Math.floor(-y),
                pixelColor: getImageDataAtPixel(
                  // Technically the job of a fragment shader (I think?)
                  // But may as well do this here to save interpolating again
                  Math.floor(uvInterpolated.x * texture.naturalWidth),
                  Math.floor((1 - uvInterpolated.y) * texture.naturalHeight),
                  this._textureImageData[activeTexture]
                ),
                worldNormal,
                centroid,
              });

              // this._rasterContext?.drawImage(
              //   textures[activeTexture],
              //   uvInterpolated.x * naturalWidth,
              //   (1 - uvInterpolated.y) * naturalHeight,
              //   1,
              //   1,
              //   Math.floor(x),
              //   Math.floor(-y),
              //   1,
              //   1
              // );

              triangle.texturePoints.forEach(
                (tp, i) => (tp.comps = originalTexturePoints[i])
              );
            }
          }
        }
      } else {
        // TODO: No texture
      }
    });

    return buffer;
  }
}
