import { Vector } from '../../math/vector/Vector';
import { MeshStyle } from './Mesh';

export type MeshData = {
  name: string;
  vertices: Vector[];
  triangles: number[][];
  style: MeshStyle;
};
