import { Entity } from '@vertex/api/game/entity/Entity';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { Camera } from '../camera/Camera';
import { cameraBounds } from '../camera/Camera.utils';
import { Triangle } from '../triangle/Triangle';
import {
  GraphicsPipelineStage,
  RasterObject,
} from '../engine/GraphicsEngine.types';
import { printOne } from '../engine/GraphicsEngine';

export class VertexShader implements GraphicsPipelineStage {
  constructor(
    private _projectionMatrix: Matrix,
    private _camera: Camera,
    private _canvasWidth: number,
    private _canvasHeight: number,
    private _canvasScale: number
  ) {}

  compute(entity: Entity, variables: Record<string, any>) {
    const mesh = entity.mesh;
    if (!mesh) return null;

    const worldMatrix = Matrix.worldMatrix(
      entity.body?.rotation,
      entity.body?.position
    );

    const preFragments: RasterObject[] = [];
    const toPreFragments: RasterObject[] = [];

    const { viewMatrix } = Matrix.viewMatrix(this._camera);

    entity.mesh?.triangles.forEach((triangle) => {
      const worldPoints = triangle.points.map(
        (point) => worldMatrix.mult(point.matrix).vector
      );

      const worldNormal = Vector.sub(worldPoints[1], worldPoints[0])
        .cross(Vector.sub(worldPoints[2], worldPoints[0]))
        .normalize()
        .extend(0);

      const raySimilarity = Vector.sub(
        Vector.extended(this._camera.position, 1),
        worldPoints[0]
      )
        .normalize()
        .dot(worldNormal);

      // TODO: Use Camera.shouldCull
      if (raySimilarity < 0) return;

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
            .set(3, 1)
            .slice(0, 3)
        );

        // perspectivePoints.forEach((point) => {
        //   // NDC to screen
        //   point.x *= this.canvas_canvasWidth / 2;
        //   point.y *= this.canvasH_canvasHeight / 2;
        // });

        toPreFragments.push({
          triangle: new Triangle(
            perspectivePoints,
            _triangle.color,
            _triangle.style,
            _triangle.texturePoints
          ),
          worldNormal,
          centroid: Vector.add(
            Vector.add(projectedPoints[0], projectedPoints[1]),
            projectedPoints[2]
          ).div(3),
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
