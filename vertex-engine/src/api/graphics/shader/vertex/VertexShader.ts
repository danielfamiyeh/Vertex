import { Entity } from '../../../game/entity/Entity';
import {
  Matrix,
  matrixMultiply,
  matrixToVector,
  matrixView,
  matrixWorld,
} from '../../../math/matrix/Matrix';
import {
  Vector,
  vectorAdd,
  vectorCross,
  vectorDiv,
  vectorDot,
  vectorScale,
  vectorSet,
  vectorSlice,
  vectorSub,
  vectorToColumnMatrix,
  vectorToRowMatrix,
} from '../../../math/vector/Vector';
import { Camera } from '../../camera/Camera';
import { Triangle } from '../../triangle/Triangle';
import { RasterObject } from '../../engine/GraphicsEngine.types';
import { Pool } from '../../../util/pool/Pool';
import { printOne } from '../../engine/GraphicsEngine';
export class VertexShader {
  constructor(
    private _projectionMatrix: Matrix,
    private _camera: Camera,
    private _canvasWidth: number,
    private _canvasHeight: number,
    private _canvasScale: number
  ) {}

  compute(
    entity: Entity,
    vectorPool: Pool<Vector>,
    trianglePool: Pool<Triangle>
  ) {
    const mesh = entity.mesh;
    if (!mesh) return null;

    const worldMatrix = matrixWorld(
      entity.body?.rotation,
      entity.body?.position
    );

    const fragments: RasterObject[] = [];
    const toPreFragments: RasterObject[] = [];

    const { viewMatrix } = matrixView(this._camera);

    entity.mesh?.triangles.forEach((triangle) => {
      const worldPoints = worldMatrix
        ? triangle.points.map((tPoint) => {
            const [[x], [y], [z], [w]] = matrixMultiply(
              worldMatrix,
              vectorToColumnMatrix([...tPoint, 1])
            );
            const point = vectorPool.get();
            point[0] = x;
            point[1] = y;
            point[2] = z;
            point[3] = w;
            return point.slice(0, 3);
          })
        : triangle.points;

      const worldNormal = vectorCross(
        vectorSub(worldPoints[1], worldPoints[0]),
        vectorSub(worldPoints[2], worldPoints[0])
      );

      const vPointToCamera = vectorPool.get();
      vPointToCamera[0] = this._camera.position[0] - worldPoints[0][0];
      vPointToCamera[1] = this._camera.position[1] - worldPoints[0][1];
      vPointToCamera[2] = this._camera.position[2] - worldPoints[0][2];

      // TODO: Use Camera.shouldCull
      if (vectorDot(vPointToCamera, worldNormal) < 0) return;
      vectorPool.free(vPointToCamera);

      const viewPoints = worldPoints
        .map((point) =>
          matrixToVector(
            matrixMultiply(vectorToRowMatrix([...point, 1]), viewMatrix)
          )
        )
        .map((v) => v.slice(0, 3));

      // I'm guessing a depth buffer would help with this?
      // const clippedTriangles = this._camera.frustrum.near.clipTriangle(
      new Triangle(
        viewPoints,
        triangle.color,
        triangle.style,
        triangle.texturePoints
      );
      // );

      const clippedTriangles = [
        new Triangle(
          viewPoints,
          triangle.color,
          triangle.style,
          triangle.texturePoints
        ),
      ];

      clippedTriangles.forEach((_triangle: Triangle) => {
        const projectedPoints = _triangle.points.map((point) =>
          matrixToVector(
            matrixMultiply(
              this._projectionMatrix,
              vectorToColumnMatrix([...point, 1])
            )
          )
        );

        // perspectivePoints.forEach((point) => {
        //   // NDC to screen
        //   point[0] *= this.canvas_canvasWidth / 2;
        //   point[1] *= this.canvasH_canvasHeight / 2;
        // });

        const perspectivePoints = projectedPoints.map((point) => {
          const p = vectorDiv(point, point[2]);
          const scaled = vectorScale(
            p,
            (this._canvasHeight / this._canvasWidth) * this._canvasScale
          );
          const updated = vectorSet(scaled, 2, 1);
          return vectorSlice(updated, 0, 3);
        });

        const centroid = vectorDiv(
          vectorAdd(
            vectorAdd(projectedPoints[0], projectedPoints[1]),
            projectedPoints[2]
          ),
          3
        );

        worldPoints.forEach((p) => vectorPool.free(p));

        const triangle = trianglePool.get();
        triangle.points = perspectivePoints;
        triangle.color = _triangle.color;
        triangle.style = _triangle.style;
        triangle.texturePoints = _triangle.texturePoints;

        toPreFragments.push({
          triangle: triangle,
          worldNormal,
          centroid,
          activeTexture: mesh.activeTexture,
        });
      });
    });

    // Clipping routine
    // toPreFragments.forEach((rasterObj) => {
    //   const queue: RasterObject[] = [];
    //   queue.push(rasterObj);
    //   let numNewTriangles = 1;

    //   cameraBounds.forEach((bound) => {
    //     while (numNewTriangles > 0) {
    //       const _rasterObj = queue.pop();
    //       if (!_rasterObj) return;
    //       numNewTriangles--;

    //       const clippedTriangles: Triangle[] = this._camera.frustrum[
    //         bound
    //       ].clipTriangle(_rasterObj.triangle);

    //       queue.push(
    //         ...clippedTriangles
    //           .filter((t) => t)
    //           .map((t) => ({
    //             triangle: t,
    //             worldNormal: _rasterObj.worldNormal,
    //             centroid: _rasterObj.centroid,
    //             activeTexture: _rasterObj.activeTexture,
    //           }))
    //       );
    //     }
    //     numNewTriangles = queue.length;
    //   });

    //   preFragments.push(...queue);
    // });
    // TODO: this is not clipping
    return toPreFragments;
  }
}
function vectorMultiply(arg0: number[][], viewMatrix: Matrix) {
  throw new Error('Function not implemented.');
}
