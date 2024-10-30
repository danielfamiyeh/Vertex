import { Vector } from '../../math/vector/Vector';
import { Color } from '../color/Color';

export interface Light {
  illuminate(normal?: Vector, point?: Vector): Color;
}
