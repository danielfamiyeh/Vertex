import {
  vectorCross,
  vectorNormalize,
  vectorScale,
} from '../../math/vector/Vector';
import { CameraOptions } from './Camera.types';
import { GameEngine } from '../../game/engine/GameEngine';
import { RigidBody } from 'src/api/physics/rigid-body/RigidBody';

export const upVector = [0, 1, 0];

export class Camera {
  // @ts-ignore
  private _displacement: number;
  private _rotationalDisplacement: number;
  private _body: RigidBody;
  private _near: number;
  private _far: number;

  constructor(options: CameraOptions) {
    this._displacement = options.displacement;
    this._rotationalDisplacement = options.displacement / 50;
    this._body = options.body;
    this._near = options.near;
    this._far = options.far;

    addEventListener('keydown', this.defaultKeydownListener.bind(this));
    addEventListener('keyup', this.defaultKeyUpListener.bind(this));
  }

  defaultKeyUpListener(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    // @ts-ignore
    const cameraEntity = (window.__VERTEX_GAME_ENGINE__ as GameEngine)
      .cameraEntity;

    if (!cameraEntity.body) return;

    if (key === 'w' || key === 's') {
      cameraEntity.body.forces.velocity = [0, 0, 0];
    }

    if (key === 'arrowdown' || key === 'arrowup') {
      cameraEntity.body.forces.velocity[1] = 0;
    }

    if (key === 'arrowright' || key === 'arrowleft') {
      cameraEntity.body.forces.velocity = [0, 0, 0];
    }

    if (key === 'a' || key === 'd') {
      cameraEntity.body.forces.rotation[0] = 0;
    }
  }

  defaultKeydownListener(event: KeyboardEvent) {
    // @ts-ignore
    const cameraEntity = (window.__VERTEX_GAME_ENGINE__ as GameEngine)
      .cameraEntity;

    if (!cameraEntity.body) return;

    if (event.key === 'ArrowUp') {
      cameraEntity.body.forces.velocity[1] = this._displacement;
    }

    if (event.key === 'ArrowDown') {
      cameraEntity.body.forces.velocity[1] = -this._displacement;
    }

    if (event.key === 'ArrowLeft') {
      const left = vectorScale(
        vectorNormalize(vectorCross(this.body.direction, upVector)),
        this._displacement
      );

      cameraEntity.body.forces.velocity = left;
    }

    if (event.key === 'ArrowRight') {
      const right = vectorScale(
        vectorNormalize(vectorCross(this.body.direction, upVector)),
        -this._displacement
      );

      cameraEntity.body.forces.velocity = right;
    }

    if (event.key.toLowerCase() === 'a') {
      cameraEntity.body.forces.rotation[0] = -this._rotationalDisplacement;
    }

    if (event.key.toLowerCase() === 'd') {
      cameraEntity.body.forces.rotation[0] = this._rotationalDisplacement;
    }

    if (event.key.toLowerCase() === 'w') {
      cameraEntity.body.forces.velocity = vectorScale(
        vectorNormalize(this._body.direction),
        this._displacement
      );
    }

    if (event.key.toLowerCase() === 's') {
      cameraEntity.body.forces.velocity = vectorScale(
        vectorNormalize(this._body.direction),
        -this._displacement
      );
    }
  }

  get body() {
    return this._body;
  }

  get displacement() {
    return this._displacement;
  }

  get near() {
    return this._near;
  }

  get far() {
    return this._far;
  }

  set displacement(d: number) {
    this._displacement = d;
  }
}
