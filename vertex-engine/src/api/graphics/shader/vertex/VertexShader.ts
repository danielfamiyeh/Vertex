import { Entity } from '../../../game/entity/Entity';
import { Matrix } from '../../../math/matrix/Matrix';
import { Vector } from '../../../math/vector/Vector';
import { Camera } from '../../camera/Camera';
import { Triangle } from '../../triangle/Triangle';
import { RasterObject } from '../../engine/GraphicsEngine.types';
import { Pool } from '../../../util/pool/Pool';
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

    const worldMatrix = Matrix.worldMatrix(
      entity.body?.rotation,
      entity.body?.position
    );

    const fragments: RasterObject[] = [];
    const toPreFragments: RasterObject[] = [];

    const { viewMatrix } = Matrix.viewMatrix(this._camera);

    entity.mesh?.triangles.forEach((triangle) => {
      const worldPoints = worldMatrix
        ? triangle.points.map((tPoint) => {
            const [[x], [y], [z], [w]] = worldMatrix.mult(tPoint.matrix).mat;
            const point = vectorPool.get();
            point.x = x;
            point.y = y;
            point.z = z;
            point.w = w;
            point.dim = 4;
            return point;
          })
        : triangle.points;

      const worldNormal = Vector.sub(worldPoints[1], worldPoints[0]).cross(
        Vector.sub(worldPoints[2], worldPoints[0])
      );

      const vPointToCamera = vectorPool.get();
      vPointToCamera.x = this._camera.position.x - worldPoints[0].x;
      vPointToCamera.y = this._camera.position.y - worldPoints[0].y;
      vPointToCamera.z = this._camera.position.z - worldPoints[0].z;

      // TODO: Use Camera.shouldCull
      if (vPointToCamera.dot(worldNormal) < 0) return;
      vectorPool.free(vPointToCamera);

      const viewPoints = worldPoints
        .map((point) => point.rowMatrix.mult(viewMatrix).vector)
        .map((v) => v.slice(0, 3));

      // I'm guessing a depth buffer would help with this?
      const clippedTriangles = this._camera.frustrum.near.clipTriangle(
        new Triangle(
          viewPoints,
          triangle.color,
          triangle.style,
          triangle.texturePoints
        )
      );

      clippedTriangles.forEach((_triangle: Triangle) => {
        const projectedPoints = _triangle.points.map(
          (point) =>
            this._projectionMatrix.mult(Vector.extended(point, 1).columnMatrix)
              .vector
        );

        const perspectivePoints = projectedPoints.map((point) =>
          point
            .div(point.z)
            .scale((this._canvasHeight / this._canvasWidth) * this._canvasScale)
            .set(2, 1)
            .slice(0, 3)
        );

        // perspectivePoints.forEach((point) => {
        //   // NDC to screen
        //   point.x *= this.canvas_canvasWidth / 2;
        //   point.y *= this.canvasH_canvasHeight / 2;
        // });

        const centroid = vectorPool
          .get()
          .add(projectedPoints[0], projectedPoints[1], projectedPoints[2])
          .div(3);

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
