import { Mesh } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.utils';
import { Triangle } from '../triangle/Triangle';
import { cameraBounds } from '../camera/Camera.utils';
import { Entity } from '../../game/entity/Entity';
import { Sphere } from '../../math/sphere/Sphere';
import { Light } from '../light/Light';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { GameEngine } from '../../game/engine/GameEngine';
import { Color } from '../color/Color';

let printed = false;
function print(message: string) {
  !printed && console.log(message);
  printed = true;
}

export class GraphicsEngine {
  // TODO: Underscore all private class members
  private _ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private camera: Camera;
  private _meshes: Record<string, Mesh> = {};
  private _lights: Record<string, Light> = {};
  private scale: number;
  private _style: 'fill' | 'stroke';

  static angle = 180;

  constructor(
    private _canvas = document.getElementById('canvas') as HTMLCanvasElement,
    options?: GraphicsEngineOptions
  ) {
    this._ctx = this._canvas.getContext('2d', { alpha: false });

    if (!this._ctx) throw new Error('Cannot access Canvas context');

    const _options = Object.assign(
      {},
      GRAPHICS_ENGINE_OPTIONS_DEFAULTS,
      options
    );

    const { projectionMatrix, zOffset } = Matrix.projectionMatrix(
      _canvas,
      _options.camera.near,
      _options.camera.far,
      _options.camera.fieldOfView
    );

    this.scale = options?.scale ?? _canvas.width;
    this.projectionMatrix = projectionMatrix;

    this.camera = new Camera({
      position: _options.camera.position,
      direction: _options.camera.direction,
      displacement: _options.camera.displacement,
      near: _options.camera.near,
      far: _options.camera.far,
      bottom: _canvas.height,
      right: _canvas.width,
      rotation: _options.camera.rotation,
    });

    const cameraEntity = new Entity('__CAMERA__');

    cameraEntity.body = new RigidBody({
      position: this.camera.position,
      rotation: this.camera.direction,
    });

    // @ts-ignore
    const gameEngine = window.__VERTEX_GAME_ENGINE__ as GameEngine;
    gameEngine.addToScene({ camera: cameraEntity });

    cameraEntity.body.forces.velocity = new Vector(0, 0, 0);
    cameraEntity.body.forces.rotation = new Vector(0, 0, 0);

    cameraEntity.body.transforms.move = () => {
      cameraEntity.body?.position.add(cameraEntity.body.forces.velocity);
    };

    cameraEntity.body.transforms.rotate = () => {
      cameraEntity.body?.rotation.add(cameraEntity.body.forces.rotation);
    };

    this._style = _options.style;
    this._meshes = {};
  }

  private geometry(entity: Entity) {
    const { camera, projectionMatrix } = this;
    const lightIds = Object.keys(this._lights);

    const raster: Triangle[] = [];
    const toRaster: Triangle[] = [];

    const { viewMatrix } = Matrix.viewMatrix(camera);

    const mesh = entity.mesh;
    const worldMatrix = Matrix.worldMatrix(
      entity.body?.rotation,
      entity.body?.position
    );

    if (!mesh) return;

    mesh.triangles.forEach((modelPoints) => {
      const worldPoints = modelPoints.map(
        (point) => worldMatrix.mult(point.matrix).vector
      );

      const worldNormal = Vector.sub(worldPoints[1], worldPoints[0])
        .cross(Vector.sub(worldPoints[2], worldPoints[0]))
        .normalize()
        .extend(0);

      const raySimilarity = Vector.sub(
        Vector.extended(camera.position, 1),
        worldPoints[0]
      )
        .normalize()
        .dot(worldNormal);

      // TODO: Use Camera.shouldCull
      if (raySimilarity < 0) return;

      const viewPoints = worldPoints.map(
        (point) => point.rowMatrix.mult(viewMatrix).vector
      );

      // I'm guessing a depth buffer would help with this?
      const clippedTriangles = camera.frustrum.near.clipTriangle(viewPoints);

      clippedTriangles.forEach((points: Vector[]) => {
        const projectedPoints = points.map(
          (point) => projectionMatrix.mult(point.columnMatrix).vector
        );

        const perspectivePoints = projectedPoints.map(
          (point) =>
            new Vector(
              ...Vector.div(point, point.z)
                .scale((this._canvas.height / this._canvas.width) * this.scale)
                .set(3, 1)
                .comps.slice(0, 3)
            )
        );

        toRaster.push(
          new Triangle(
            perspectivePoints,
            (projectedPoints[0].z +
              projectedPoints[1].z +
              projectedPoints[2].z) /
              3,
            worldNormal,
            worldPoints[0],
            ''
          )
        );
      });
    });

    // Clipping routine
    toRaster.forEach((triangle) => {
      const queue: Triangle[] = [];
      queue.push(triangle);
      let numNewTriangles = 1;

      cameraBounds.forEach((bound) => {
        while (numNewTriangles > 0) {
          const _triangle = queue.pop();
          if (!_triangle) return;
          numNewTriangles--;

          const clippedTriangles: Triangle[] = camera.frustrum[bound]
            .clipTriangle(_triangle.points.filter((t) => t))
            .map(
              (points) =>
                new Triangle(
                  points,
                  _triangle.zMidpoint,
                  _triangle.worldNormal,
                  _triangle.worldPoint,
                  _triangle.color
                )
            );

          queue.push(...clippedTriangles.filter((t) => t));
        }
        numNewTriangles = queue.length;
      });

      raster.push(...queue);
    });

    return toRaster;
  }

  private rasterize(raster: Triangle[] | undefined) {
    const lightIds = Object.keys(this._lights);

    raster &&
      raster.forEach((triangle) => {
        let lightCount = 0;
        let colorComps = [0, 0, 0];
        let colorHex = '';

        const { worldPoint, worldNormal } = triangle;

        lightIds.forEach((lightId) => {
          const light = this._lights[lightId];
          const color = light.illuminate(
            new Vector(worldNormal.x, worldNormal.y, worldNormal.z),
            worldPoint.copy()
          );
          color.comps.forEach((val, i) => (colorComps[i] += val));
          if (colorComps.reduce((a, b) => a + b, 0) > 0) lightCount++;
        });

        colorComps = colorComps.map((val) =>
          Math.round(val / (lightCount || 1))
        );
        colorHex = `#${new Color(colorComps, 'rgb').toHex()}`;
        triangle.color = `#${new Color(colorComps, 'rgb').toHex()}`;
      });
    return raster;
  }

  private screen(raster: Triangle[] | undefined) {
    if (!raster) return;

    const { ctx, style } = this;

    raster.forEach((raster) => {
      if (!ctx) return;

      const {
        points: [p1, p2, p3],
        color,
      } = raster;

      ctx[`${style}Style`] = color;

      ctx?.beginPath();
      ctx?.moveTo(p1.x, -p1.y);
      ctx?.lineTo(p2.x, -p2.y);
      ctx?.lineTo(p3.x, -p3.y);
      ctx?.lineTo(p1.x, -p1.y);
      ctx[style]();
    });
  }

  async loadMesh(id: string, url: string, scale: Vector) {
    const res = await fetch(url);
    const file = await res.text();

    const min = new Vector(Infinity, Infinity, Infinity);
    const max = new Vector(-Infinity, -Infinity, -Infinity);

    const meshData = {
      name: '',
      vertices: [] as Vector[],
      triangles: [] as Vector[][],
    };

    file.split('\n').forEach((line, i) => {
      const [type, ...parts] = line.replace(/\r/g, '').split(' ');

      if (type === 'o') {
        meshData.name = parts[0];
      } else if (type === 'v') {
        meshData.vertices.push(
          new Vector(
            ...parts.map((v, j) => {
              const _v = parseFloat(v) * scale.comps[j];
              if (_v < min.comps[j]) min.comps[j] = _v;
              if (_v > max.comps[j]) max.comps[j] = _v;

              return _v;
            }),
            1
          )
        );
      } else if (type === 'f') {
        let [p1, p2, p3] = line.slice(2).split(' ');
        if (!p1 || !p2 || !p3) {
          throw new Error(
            `Error parsing face on line ${i + 1} of file ${url}.`
          );
        }

        if (p1.includes('/')) {
          [p1] = p1.split('/');
          [p2] = p2.split('/');
          [p3] = p3.split('/');
        }
        meshData.triangles.push([
          meshData.vertices[parseInt(p1) - 1],
          meshData.vertices[parseInt(p2) - 1],
          meshData.vertices[parseInt(p3) - 1],
        ]);
      }
    });

    const mesh = new Mesh(meshData.name, meshData.vertices, meshData.triangles);
    // const boundingBox = new Box(min, max);
    const boundingSphere = new Sphere(
      Vector.add(min, max).scale(1 / 2),
      Vector.sub(max, min).mag / 2
    );

    this._meshes[id] = mesh;

    return { mesh, boundingSphere };
  }

  render(entities: Record<string, Entity>) {
    const raster: Triangle[] = [];

    Object.keys(entities).forEach((id) => {
      const entity = entities[id];
      this.render(entity.children);
      const _raster = this.rasterize(this.geometry(entity));
      _raster && raster.push(..._raster);
    });

    raster.sort((a, b) => b.zMidpoint - a.zMidpoint);

    this.screen(raster);
  }

  get lights() {
    return this._lights;
  }

  get meshes() {
    return this._meshes;
  }

  get ctx() {
    return this._ctx;
  }

  get style() {
    return this._style;
  }

  set style(style: 'fill' | 'stroke') {
    this._style = style;
  }

  get canvas() {
    return this._canvas;
  }
}
