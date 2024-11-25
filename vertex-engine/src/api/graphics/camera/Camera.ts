import { Plane } from '../../math/plane/Plane';
import {
  Vector,
  vectorCreate,
  vectorCross,
  vectorNormalize,
  vectorScale,
  vectorSub,
} from '../../math/vector/Vector';
import { CameraFrustrum, CameraOptions } from './Camera.types';
import { GameEngine } from '../../game/engine/GameEngine';

export const upVector = [0, 1, 0];

export class Camera {
  private _frustrum: CameraFrustrum = {};
  private _position: Vector;
  private _direction: Vector;
  private _displacement: number;
  private _rotation: number;

  constructor(options: CameraOptions) {
    setTimeout;
    this._position = options.position;
    this._direction = options.direction;
    this._displacement = options.displacement;
    this._rotation = options.rotation;

    // this._frustrum = {
    //   // TODO: Why are some of these flipped?
    //   near: new Plane([0, 0, options.near], [0, 0, 1],
    //   far: new Plane([0, 0, options.far], [0, 0, -1]),
    //   left: new Plane([options.right / 2, 0, 0], [1, 0, 0],
    //   right: new Plane(
    //     [-(options.right / 2), 0, 0],
    //     [-1, 0, 0]
    //   ),
    //   top: new Plane(
    //     [0, -(options.bottom / 2), 0],
    //     [0, -1, 0]
    //   ),
    //   bottom: new Plane(
    //     [0, options.bottom / 2, 0],
    //     [0, 1, 0]
    //   ),
    // };

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
        vectorNormalize(vectorCross(this.direction, upVector)),
        this._displacement
      );

      cameraEntity.body.forces.velocity = left;
    }

    if (event.key === 'ArrowRight') {
      const right = vectorScale(
        vectorNormalize(vectorCross(this.direction, upVector)),
        -this._displacement
      );

      cameraEntity.body.forces.velocity = right;
    }

    if (event.key.toLowerCase() === 'a') {
      cameraEntity.body.forces.rotation[0] = -this._rotation;
    }

    if (event.key.toLowerCase() === 'd') {
      cameraEntity.body.forces.rotation[0] = this._rotation;
    }

    if (event.key.toLowerCase() === 'w') {
      cameraEntity.body.forces.velocity = vectorScale(
        vectorNormalize(this._direction),
        this._displacement
      );
    }

    if (event.key.toLowerCase() === 's') {
      cameraEntity.body.forces.velocity = vectorScale(
        vectorNormalize(this._direction),
        -this._displacement
      );
    }
  }

  get position() {
    return this._position;
  }

  get direction() {
    return this._direction;
  }

  get displacement() {
    return this._displacement;
  }

  set displacement(d: number) {
    this._displacement = d;
  }

  get frustrum() {
    return this._frustrum;
  }
}
