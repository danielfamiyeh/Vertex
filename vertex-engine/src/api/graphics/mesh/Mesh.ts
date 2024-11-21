import { Vector } from '../../math/vector/Vector';
import { Triangle } from '../triangle/Triangle';

export type MeshStyle = 'stroke' | 'fill';

export class Mesh {
  private _textures: string[] = [];
  private _activeTexture = '';

  constructor(
    private readonly _name: string,
    private readonly _vertices: Vector[],
    private readonly _triangles: Triangle[],
    private _style: MeshStyle
  ) {}

  get vertices() {
    return this._vertices;
  }

  get triangles() {
    return this._triangles;
  }

  get name() {
    return this._name;
  }

  get textures() {
    return this._textures;
  }

  get activeTexture() {
    return this._activeTexture;
  }

  set activeTexture(activeTexture: string) {
    this._activeTexture = activeTexture;
  }

  get style() {
    return this._style;
  }

  set style(s: MeshStyle) {
    this._style = s;
  }
}
