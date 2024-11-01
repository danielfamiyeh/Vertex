import { Vector } from '../../math/vector/Vector';

export type MeshStyle = 'stroke' | 'fill';

export class Mesh {
  constructor(
    private readonly _name: string,
    private readonly _vertices: Vector[],
    private readonly _triangles: number[][],
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

  get style() {
    return this._style;
  }

  set style(s: MeshStyle) {
    this._style = s;
  }
}
