import { GraphicsEngine } from '../../graphics/engine/GraphicsEngine';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from '../../graphics/engine/GraphicsEngine.utils';
import { PhysicsEngine } from '../../physics/engine/PhysicsEngine';
import { GameEngineOptions } from './GameEngine.utils';
import { Entity } from '../entity/Entity';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { RigidBodyOptions } from '../../physics/rigid-body/RigidBody.utils';
import { Vector, vectorUniform } from '../../math/vector/Vector';
import { Scene } from '../scene/Scene';
import { MeshStyle } from '../../graphics/mesh/Mesh';

export class GameEngine {
  private _fps: number;
  private _graphics: GraphicsEngine;
  private _scene = new Scene();
  private _physics: PhysicsEngine = new PhysicsEngine();
  private _lastFrame = Date.now();

  constructor({ graphics, physics }: GameEngineOptions) {
    // @ts-ignore
    window.__VERTEX_GAME_ENGINE__ = this;

    this._graphics = new GraphicsEngine(
      document.getElementById('canvas') as HTMLCanvasElement,
      Object.assign({}, GRAPHICS_ENGINE_OPTIONS_DEFAULTS, graphics)
    );

    this._fps = graphics.fps ?? 30;
  }

  start() {
    const now = Date.now();
    const interval = 1000 / this.fps;
    const delta = now - this.lastFrame;

    if (delta > interval / 2) {
      this.physics.update(delta, this._scene.root.children);
    }

    if (delta > interval) {
      this.graphics.ctx?.clearRect(
        0,
        0,
        this.graphics.canvas.width,
        this.graphics.canvas.height
      );
      this.graphics.render(this._scene.root.children);
      this._lastFrame = now - (delta % interval);
      console.log(1 / delta);
    }

    window.requestAnimationFrame(() => this.start());
  }

  async createEntity(
    id: string,
    options: {
      graphics?: {
        mesh: string;
        scale?: Vector;
        style?: MeshStyle;
        textures?: { key: string; url: string }[];
      };
      physics?: Omit<RigidBodyOptions, 'id'>;
    } = {}
  ) {
    const { graphics, physics } = options;
    const entity = new Entity(id);

    entity.scale = graphics?.scale ?? vectorUniform(1, 3);

    if (physics)
      entity.body = new RigidBody({ parentEntity: entity, ...physics });

    if (graphics?.mesh) {
      await this.loadEntityMesh(
        entity,
        graphics.mesh,
        entity.scale,
        graphics.style ?? 'fill',
        !!graphics.textures?.length
      );
    }

    if (graphics?.textures) {
      await this.loadEntityTextures(entity, graphics.textures);
    }

    return entity;
  }

  async loadEntityTextures(
    entity: Entity,
    textureSrcMap: { key: string; url: string }[]
  ) {
    textureSrcMap.map(async ({ key, url }) => {
      await this.graphics.loadTexture(url, key);
      entity.mesh?.textures.push(key);
    });
  }

  async loadEntityMesh(
    entity: Entity,
    url: string,
    scale: Vector,
    style: MeshStyle,
    hasTextures: boolean
  ) {
    const { mesh, boundingSphere } = await this.graphics.loadMesh(
      url,
      scale,
      style,
      hasTextures
    );

    entity.mesh = mesh;

    if (entity.body !== undefined) {
      entity.body.boundingSphere = boundingSphere;
    }

    return entity;
  }

  addToScene(entities: Record<string, Entity>) {
    this._scene.root.addChildren(entities);
  }

  get cameraEntity() {
    return this._scene.root.children.camera;
  }

  get physics() {
    return this._physics;
  }

  get graphics() {
    return this._graphics;
  }

  get fps() {
    return this._fps;
  }

  get lastFrame() {
    return this._lastFrame;
  }
}
