import { Mesh, MeshStyle } from '../mesh/Mesh';
import { Camera } from '../camera/Camera';
import { Matrix, matrixProjection, matrixView } from '../../math/matrix/Matrix';
import {
  Vector,
  vectorAdd,
  vectorMag,
  vectorScale,
  vectorSub,
} from '../../math/vector/Vector';
import { GraphicsEngineOptions } from './GraphicsEngine.types';
import {
  GRAPHICS_ENGINE_OPTIONS_DEFAULTS,
  PIPELINE_STAGES,
} from './GraphicsEngine.utils';
import { Triangle } from '../triangle/Triangle';
import { Entity } from '../../game/entity/Entity';
import { Sphere } from '../../math/sphere/Sphere';
import { Light } from '../light/Light';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { GameEngine } from '../../game/engine/GameEngine';
import { MeshData } from '../mesh/Mesh.types';
import { Fragment, FragmentShader, VertexShader } from '../shader';
import { Rasterizer } from '../rasterizer/Rasterizer';
import { Framebuffer } from '../framebuffer/Framebuffer';
import { Pool } from '../../util/pool/Pool';

let printed = 0;
export const printOne = (msg: any) => {
  if (printed < 11) {
    console.log(msg);
    printed += 1;
  }
};

export class GraphicsEngine {
  // TODO: Underscore all private class members
  private _ctx: CanvasRenderingContext2D | null;

  private camera: Camera;
  private _meshData: Record<string, MeshData> = {};
  private _lights: Record<string, Light> = {};
  private scale: number;
  private _textures: Record<string, HTMLImageElement> = {};
  private _textureImageData: Record<string, ImageData> = {};
  private _framebuffer: Framebuffer;
  private _vertexShader: VertexShader;
  private _vectorPool: Pool<Vector>;
  private _trianglePool: Pool<Triangle>;
  private _fragmentQueue: Fragment[][] = [];

  constructor(
    private _canvas = document.getElementById('canvas') as HTMLCanvasElement,
    options?: GraphicsEngineOptions
  ) {
    this._ctx = this._canvas.getContext('2d', { alpha: false });

    if (!this._ctx) throw new Error('Cannot access Canvas context');

    this._ctx.imageSmoothingEnabled = false;

    const _options = Object.assign(
      {},
      GRAPHICS_ENGINE_OPTIONS_DEFAULTS,
      options
    );

    const { projectionMatrix } = matrixProjection(
      _canvas.width,
      _canvas.height,
      _options.camera.near,
      _options.camera.far,
      _options.camera.fieldOfView
    );

    this.scale = options?.scale ?? _canvas.width;

    const cameraEntity = new Entity('__CAMERA__');

    cameraEntity.body = new RigidBody({
      position: _options.camera.position,
      rotation: _options.camera.direction,
    });

    this.camera = new Camera({
      displacement: _options.camera.displacement,
      near: _options.camera.near,
      far: _options.camera.far,
      bottom: _canvas.height,
      right: _canvas.width,
      body: cameraEntity.body,
    });

    this._vertexShader = new VertexShader(
      projectionMatrix,
      this.camera,
      _canvas.width,
      _canvas.height,
      this.scale
    );

    this._vectorPool = new Pool(() => [], _options.pool.size as number);

    this._trianglePool = new Pool(
      () => new Triangle([], '', 'stroke'),
      _options.pool.size as number
    );

    this._framebuffer = new Framebuffer(this._canvas, this._ctx);

    // @ts-ignore
    const gameEngine = window.__VERTEX_GAME_ENGINE__ as GameEngine;
    gameEngine.addToScene({ camera: cameraEntity });

    cameraEntity.body.forces.velocity = [0, 0, 0];
    cameraEntity.body.forces.rotation = [0, 0, 0];

    cameraEntity.body.transforms.move = () => {
      if (cameraEntity.body?.position && cameraEntity.body.forces.velocity) {
        cameraEntity.body.position = vectorAdd(
          cameraEntity.body.position,
          cameraEntity.body.forces.velocity
        );
      }
    };

    cameraEntity.body.transforms.rotate = () => {
      if (cameraEntity.body?.position && cameraEntity.body.forces.velocity) {
        cameraEntity.body.rotation = vectorAdd(
          cameraEntity.body?.rotation,
          cameraEntity.body.forces.rotation
        );
      }
    };

    this._meshData = {};
  }

  async loadMesh(
    url: string,
    scale: Vector,
    style: MeshStyle,
    hasTextures: boolean
  ) {
    const meshExists = !!this._meshData[url];

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    if (!meshExists) {
      const res = await fetch(url);
      const file = await res.text();

      const meshData: MeshData = {
        name: '',
        vertices: [] as Vector[],
        triangles: [] as number[][],
        texturePoints: [] as Vector[],
        textureIndexes: [] as number[][],
        style,
      };

      file.split('\n').forEach((line, i) => {
        const [type, ...parts] = line.replace(/\r/g, '').split(' ');

        if (type === 'o') {
          meshData.name = parts[0];
        } else if (type === 'v') {
          meshData.vertices.push(
            parts.map((c, i) => {
              const comp = parseFloat(c);
              if (comp < min[i]) min[i] = comp;
              if (comp > max[i]) max[i] = comp;
              return comp;
            })
          );
        } else if (type === 'vt' && hasTextures) {
          const [u, v] = parts.filter((tc) => tc).map((tc) => parseFloat(tc));
          const texturePoint = [u, v];
          meshData.texturePoints.push(texturePoint);
        } else if (type === 'f') {
          let [f1, f2, f3] = line.slice(2).split(' ');
          if (!f1 || !f2 || !f3) {
            throw new Error(
              `Error parsing face on line ${i + 1} of file ${url}.`
            );
          }
          let p1, p2, p3, t1, t2, t3;
          if (f1.includes('/')) {
            [p1, t1] = f1.split('/');
            [p2, t2] = f2.split('/');
            [p3, t3] = f3.split('/');
          }

          if (p1 && p2 && p3) {
            meshData.triangles.push([
              parseInt(p1) - 1,
              parseInt(p2) - 1,
              parseInt(p3) - 1,
            ]);
          }

          if (t1 && t2 && t3) {
            meshData.textureIndexes.push([
              parseInt(t1) - 1,
              parseInt(t2) - 1,
              parseInt(t3) - 1,
            ]);
          }
        }
      });

      const modelMidpoint = min.map((c, i) => (c + max[i]) / 2);

      meshData.vertices = meshData.vertices.map((v) =>
        v.map((c, i) => c - modelMidpoint[i])
      );

      this._meshData[url] = meshData;
    }

    return this.loadMeshFromCache(url, scale, style, hasTextures);
  }

  async loadMeshFromCache(
    url: string,
    scale: Vector,
    style: MeshStyle,
    hasTextures: boolean
  ) {
    const cachedMesh = this._meshData[url];

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    const meshData: Omit<MeshData, 'style' | 'triangles'> & {
      triangles: Triangle[];
    } = {
      name: cachedMesh.name,
      vertices: cachedMesh.vertices.map(
        (v) =>
          v.map((c, i) => {
            const _v = c * scale[i];
            if (_v < min[i]) min[i] = _v;
            if (_v > max[i]) max[i] = _v;

            return _v;
          }),
        1
      ),
      texturePoints: cachedMesh.texturePoints,
      textureIndexes: cachedMesh.textureIndexes,
      triangles: [],
    };

    meshData.triangles = cachedMesh.triangles.map(
      (points, i) =>
        new Triangle(
          points.map((idx) => meshData.vertices[idx]),
          '',
          style,
          hasTextures
            ? cachedMesh.textureIndexes[i].map(
                (idx) => cachedMesh.texturePoints[idx]
              )
            : []
        )
    );

    // TODO: lmao there's gotta be something here that's causing the collision detection to mess up
    const boundingSphere = new Sphere(
      vectorScale(vectorSub(min, max), 0.5),
      vectorMag(vectorSub(max, min)) / 2 // TODO: use mag squared for collision detection
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

    await new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = (evt) => {
        const image = evt.target as HTMLImageElement;
        this._textures[key] = image;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        image.setAttribute('crossOrigin', '');

        ctx?.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        // TODO: throw if undefined
        if (imageData) this._textureImageData[key] = imageData;

        resolve(image.height);
      };

      image.onerror = (evt) => reject(evt);
    });
  }

  private _handleWorker(evt: MessageEvent<any>) {
    switch (evt.data.stage) {
      case PIPELINE_STAGES.rasterization: {
        // @ts-ignore
        window.__VERTEX_GAME_ENGINE__?.graphics.fragmentQueue.push(
          evt.data.fragments
        );
      }
    }
  }

  render(entities: Record<string, Entity>) {
    let newFragments = false;

    Object.keys(entities).forEach((id, i) => {
      const entity = entities[id];
      this.render(entity.children);

      const vertexOutput = this._vertexShader.compute(entity, this.camera);

      if (vertexOutput) {
        const textureKey = entity.mesh?.activeTexture ?? '';
        // this._worker.postMessage({
        //   stage: PIPELINE_STAGES.rasterization,
        //   args: {
        //     vertexOutput,
        //     imageData: this._textureImageData[textureKey],
        //   },
        // });

        // const fragments = this._fragmentQueue.shift();
        const fragments = Rasterizer.compute(
          vertexOutput,
          this._textureImageData[textureKey],
          {
            width: this.canvas.width,
            height: this.canvas.height,
          }
        );
        if (fragments) {
          // FragmentShader.compute(
          //   fragments,
          //   Object.values(this.lights),
          //   this._vectorPool
          // );
          newFragments = true;
          this.framebuffer.drawFragments(fragments);
        }
      }
    });

    if (newFragments) this._framebuffer.drawToScreen();
  }

  get fragmentQueue() {
    return this._fragmentQueue;
  }

  get framebuffer() {
    return this._framebuffer;
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
