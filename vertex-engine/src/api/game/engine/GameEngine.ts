import { GraphicsEngine } from '../../graphics/engine/GraphicsEngine';
import { GRAPHICS_ENGINE_OPTIONS_DEFAULTS } from '../../graphics/engine/GraphicsEngine.utils';
import { PhysicsEngine } from '../../physics/engine/PhysicsEngine';
import { GameEngineOptions } from './GameEngine.utils';
import { Entity } from '../entity/Entity';
import { RigidBody } from '../../physics/rigid-body/RigidBody';
import { RigidBodyOptions } from '@vertex/api/physics/rigid-body/RigidBody.utils';
import { Vector } from '../../math/vector/Vector';
import { Scene } from '../scene/Scene';

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
    const {
      graphics: { ctx, canvas },
    } = this;

    if (delta > interval / 2) {
      this.physics.update(delta, this._scene.root.children);
    }

    if (delta > interval) {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.translate(canvas.width / 2, canvas.height / 2);

      this.graphics.render(this._scene.root.children);

      ctx?.translate(-canvas.width / 2, -canvas.height / 2);

      this._lastFrame = now - (delta % interval);
    }

    window.requestAnimationFrame(() => this.start());
  }

  async createEntity(
    id: string,
    options: {
      graphics?: {
        mesh: string;
        scale?: Vector;
      };
      physics?: Omit<RigidBodyOptions, 'id'>;
    } = {}
  ) {
    const { graphics, physics } = options;
    const entity = new Entity(id);

    entity.scale = graphics?.scale ?? new Vector(1, 1, 1);

    if (physics) entity.body = new RigidBody({ id, ...physics });

    if (graphics?.mesh)
      await this.loadEntityMesh(entity, graphics.mesh, entity.scale);

    return entity;
  }

  async loadEntityMesh(entity: Entity, url: string, scale: Vector) {
    // TODO: Caching
    const { mesh, boundingSphere } = await this.graphics.loadMesh(
      entity.id,
      url,
      scale
    );

    entity.mesh = mesh;

    if (entity.body !== undefined) {
      entity.body.boundingSphere = boundingSphere;
    }

    return entity;
  }

  get scene() {
    return this._scene;
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
