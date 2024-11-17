import { Mesh, MeshStyle } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix } from '../../math/matrix/Matrix';
import { Vector } from '../../math/vector/Vector';
import { GraphicsEngineOptions, RasterObject } from './GraphicsEngine.types';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from './GraphicsEngine.utils';
import { Triangle } from '../triangle/Triangle';
import { cameraBounds } from '../camera/Camera.utils';
import { Entity } from '../../game/entity/Entity';
import { Sphere } from '../../math/sphere/Sphere';
import { Light } from '../light/Light';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { GameEngine } from '../../game/engine/GameEngine';
import { Color } from '../color/Color';
import { MeshData } from '../mesh/Mesh.types';

export class GraphicsEngine {
  // TODO: Underscore all private class members
  private _ctx: CanvasRenderingContext2D | null;
  private projectionMatrix: Matrix;
  private camera: Camera;
  private _meshData: Record<string, MeshData> = {};
  private _lights: Record<string, Light> = {};
  private scale: number;
  private _textures: Record<string, HTMLImageElement> = {};

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

    this._meshData = {};
  }

  private geometry(entity: Entity) {
    const { camera, projectionMatrix } = this;

    const raster: RasterObject[] = [];
    const toRaster: RasterObject[] = [];

    const { viewMatrix } = Matrix.viewMatrix(camera);

    const mesh = entity.mesh;
    const worldMatrix = Matrix.worldMatrix(
      entity.body?.rotation,
      entity.body?.position
    );

    if (!mesh) return;

    mesh.triangles.forEach((triangle) => {
      const worldPoints = triangle.points.map(
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
      const clippedTriangles = camera.frustrum.near.clipTriangle(
        new Triangle(
          viewPoints,
          triangle.color,
          triangle.style,
          triangle.texturePoints
        )
      );

      clippedTriangles.forEach((triangle: Triangle) => {
        const projectedPoints = triangle.points.map(
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

        toRaster.push({
          triangle: new Triangle(
            perspectivePoints,
            triangle.color,
            triangle.style,
            triangle.texturePoints
          ),
          worldNormal,
          centroid: Vector.div(
            Vector.add(
              Vector.add(projectedPoints[0], projectedPoints[1]),
              projectedPoints[2]
            ),
            3
          ),
        });
      });
    });

    // Clipping routine
    toRaster.forEach((rasterObj) => {
      const queue: RasterObject[] = [];
      queue.push(rasterObj);
      let numNewTriangles = 1;

      cameraBounds.forEach((bound) => {
        while (numNewTriangles > 0) {
          const _rasterObj = queue.pop();
          if (!_rasterObj) return;
          numNewTriangles--;

          const clippedTriangles: Triangle[] = camera.frustrum[
            bound
          ].clipTriangle(_rasterObj.triangle);

          queue.push(
            ...clippedTriangles
              .filter((t) => t)
              .map((t) => ({
                triangle: t,
                worldNormal: _rasterObj.worldNormal,
                centroid: _rasterObj.centroid,
              }))
          );
        }
        numNewTriangles = queue.length;
      });

      raster.push(...queue);
    });

    return toRaster;
  }

  private rasterize(raster: RasterObject[] | undefined) {
    const lightIds = Object.keys(this._lights);

    raster &&
      raster.forEach((rasterObj) => {
        let colorComps = [0, 0, 0];

        const { centroid, worldNormal, triangle } = rasterObj;

        lightIds.forEach((lightId) => {
          const light = this._lights[lightId];
          const color = light.illuminate(
            new Vector(worldNormal.x, worldNormal.y, worldNormal.z),
            centroid.copy()
          );
          color.comps.forEach((val, i) => (colorComps[i] += val));
        });

        colorComps = colorComps.map((val) => Math.min(val, 255));
        triangle.color = `#${new Color(colorComps, 'rgb').toHex()}`;
      });
    return raster;
  }

  private screen(raster: RasterObject[] | undefined) {
    if (!raster) return;

    const { ctx } = this;

    raster.forEach((rasterObj) => {
      if (!ctx) return;

      const {
        points: [p1, p2, p3],
        color,
        style,
      } = rasterObj.triangle;

      ctx[`${style}Style`] = color;

      ctx?.beginPath();
      ctx?.moveTo(p1.x, -p1.y);
      ctx?.lineTo(p2.x, -p2.y);
      ctx?.lineTo(p3.x, -p3.y);
      ctx?.lineTo(p1.x, -p1.y);
      ctx[style]();
    });
  }

  async loadMesh(url: string, scale: Vector, style: MeshStyle) {
    const meshExists = !!this._meshData[url];

    if (!meshExists) {
      const res = await fetch(url);
      const file = await res.text();

      const meshData: MeshData = {
        name: '',
        vertices: [] as Vector[],
        triangles: [] as number[][],
        style,
      };

      file.split('\n').forEach((line, i) => {
        const [type, ...parts] = line.replace(/\r/g, '').split(' ');

        if (type === 'o') {
          meshData.name = parts[0];
        } else if (type === 'v') {
          meshData.vertices.push(
            new Vector(...parts.map((c) => parseFloat(c)))
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
            parseInt(p1) - 1,
            parseInt(p2) - 1,
            parseInt(p3) - 1,
          ]);
        }
      });

      this._meshData[url] = meshData;
    }

    return this.loadMeshFromCache(url, scale, style);
  }

  async loadMeshFromCache(url: string, scale: Vector, style: MeshStyle) {
    const cachedMesh = this._meshData[url];

    const min = new Vector(Infinity, Infinity, Infinity);
    const max = new Vector(-Infinity, -Infinity, -Infinity);

    const meshData: Omit<MeshData, 'style' | 'triangles'> & {
      triangles: Triangle[];
    } = {
      name: cachedMesh.name,
      vertices: cachedMesh.vertices.map(
        (v) =>
          new Vector(
            ...v.comps.map((c, i) => {
              const _v = c * scale.comps[i];
              if (_v < min.comps[i]) min.comps[i] = _v;
              if (_v > max.comps[i]) max.comps[i] = _v;

              return _v;
            }),
            1
          )
      ),
      triangles: [],
    };

    meshData.triangles = cachedMesh.triangles.map(
      (points) =>
        new Triangle(
          points.map((idx) => meshData.vertices[idx]),
          '',
          style
        )
    );

    // TODO: lmao there's gotta be something here that's causing the collision detection to mess up
    const boundingSphere = new Sphere(
      Vector.add(min, max).scale(1 / 2),
      Vector.sub(max, min).mag / 2
    );

    const mesh = new Mesh(
      meshData.name,
      meshData.vertices,
      meshData.triangles,
      style
    );

    return { mesh, boundingSphere };
  }

  async loadTexture(url: string, key = url) {
    const textureExists = !!this._textures[key];
    if (textureExists) return this._textures[key];

    const res = await fetch(key);
    const file = await res.blob();

    const base64 = await new Promise<string>((onSuccess, onError) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          onSuccess(this.result as string);
        };
        reader.readAsDataURL(file);
      } catch (e) {
        onError(e);
      }
    });

    const image = new Image();
    image.src = base64;

    this._textures[key] = image;
  }

  render(entities: Record<string, Entity>) {
    const raster: RasterObject[] = [];

    Object.keys(entities).forEach((id) => {
      const entity = entities[id];
      this.render(entity.children);

      const _raster = this.rasterize(this.geometry(entity));
      _raster && raster.push(..._raster);
    });

    raster.sort((a, b) => b.centroid.z - a.centroid.z);

    this.screen(raster);
  }

  get lights() {
    return this._lights;
  }

  get meshes() {
    return this._meshData;
  }

  get ctx() {
    return this._ctx;
  }

  get canvas() {
    return this._canvas;
  }
}
