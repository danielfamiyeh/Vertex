import { Entity } from '../../../game/entity/Entity';
import {
  Matrix,
  matrixMultiply,
  matrixToVector,
  matrixView,
  matrixWorld,
} from '../../../math/matrix/Matrix';
import {
  vectorCross,
  vectorDiv,
  vectorDot,
  vectorScale,
  vectorSub,
  vectorToColumnMatrix,
  vectorToRowMatrix,
} from '../../../math/vector/Vector';
import { Camera } from '../../camera/Camera';
import { Triangle } from '../../triangle/Triangle';
import { RasterObject } from '../../engine/GraphicsEngine.types';
import { printOne } from '../../engine/GraphicsEngine';
import { planeClipTriangle } from '../../../math/plane/Plane';

export class VertexShader {
  constructor(
    private _projectionMatrix: Matrix,
    private _camera: Camera,
    private _canvasWidth: number,
    private _canvasHeight: number,
    private _canvasScale: number
  ) {}

  compute(entity: Entity, camera: Camera) {
    const mesh = entity.mesh;
    if (!mesh) return null;

    const worldMatrix = matrixWorld(
      entity.body?.direction,
      entity.body?.position
    );

    const { viewMatrix } = matrixView(camera);

    const fragments: RasterObject[] = [];

    entity.mesh?.triangles.forEach((triangle) => {
      const worldPoints = worldMatrix
        ? triangle.points.map((tPoint) =>
            matrixToVector(
              matrixMultiply(worldMatrix, vectorToColumnMatrix([...tPoint, 1]))
            ).slice(0, 3)
          )
        : triangle.points;

      const worldNormal = vectorCross(
        vectorSub(worldPoints[1], worldPoints[0]),
        vectorSub(worldPoints[2], worldPoints[0])
      );

      const vPointToCamera = vectorSub(
        [...this._camera.body.position, 1],
        worldPoints[0]
      );

      if (
        // Backface culling
        vectorDot(vPointToCamera, worldNormal) < 0
      ) {
        return;
      }

      const viewPoints = worldPoints
        .map((point) =>
          matrixToVector(
            matrixMultiply(vectorToRowMatrix([...point, 1]), viewMatrix)
          )
        )
        .map((v) => v.slice(0, 3));

      const viewTriangle = new Triangle(
        viewPoints,
        triangle.color,
        triangle.style,
        triangle.texturePoints
      );

      planeClipTriangle(camera.near, viewTriangle)
        .flatMap((t) => planeClipTriangle(camera.far, t))
        .forEach((t) => {
          const projectedPoints = t.points.map((point) =>
            matrixToVector(
              matrixMultiply(
                this._projectionMatrix,
                vectorToColumnMatrix([...point, 1])
              )
            )
          );

          const perspectivePoints = projectedPoints.map((point) => {
            const p = vectorDiv(point, point[2]);
            const scaled = vectorScale(
              p,
              (this._canvasHeight / this._canvasWidth) * this._canvasScale
            );
            scaled[2] = 1;
            return scaled.slice(0, 3);
          });

          viewTriangle.points = perspectivePoints;

          planeClipTriangle(camera.left, viewTriangle)
            .flatMap((t) => planeClipTriangle(camera.top, t))
            .flatMap((t) => planeClipTriangle(camera.right, t))
            .flatMap((t) => planeClipTriangle(camera.bottom, t))
            .forEach((t) => {
              fragments.push({
                triangle: t,
                worldNormal,
                centroid: worldPoints[0],
                activeTexture: mesh.activeTexture,
              });
            });
        });
    });
    return fragments;
  }
}
