import { Matrix } from '../matrix/Matrix';

export type Vector = number[];

export function vectorCreate(...comps: number[]): Vector {
  return [...comps];
}

export function vectorUniform(num: number, dim: number): Vector {
  return new Array(dim).fill(num);
}

export function vectorZeroes(dim: number): Vector {
  return new Array(dim).fill(0);
}

export function vectorAdd(v1: Vector, v2: Vector): Vector {
  const maxDim = Math.max(v1.length, v2.length);
  return Array.from({ length: maxDim }, (_, i) => (v1[i] || 0) + (v2[i] || 0));
}

export function vectorSub(v1: Vector, v2: Vector): Vector {
  const maxDim = Math.max(v1.length, v2.length);
  return Array.from({ length: maxDim }, (_, i) => (v1[i] || 0) - (v2[i] || 0));
}

export function vectorNormalize(v: Vector): Vector {
  const mag = vectorMag(v);
  return v.map((comp) => comp / mag);
}

export function vectorDiv(v: Vector, lambda: number): Vector {
  return v.map((comp) => comp / lambda);
}

export function vectorScale(v: Vector, lambda: number): Vector {
  return v.map((comp) => comp * lambda);
}

export function vectorExtended(v: Vector, ...components: number[]): Vector {
  return v.concat(components);
}

export function vectorDot(v1: Vector, v2: Vector): number {
  return v1.reduce((sum, comp, i) => sum + comp * (v2[i] || 0), 0);
}

export function vectorCross(v1: Vector, v2: Vector): Vector {
  if (v1.length !== 3 || v2.length !== 3) {
    throw new Error('Cross product is only defined for 3D vectors');
  }
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
}

export function vectorIsEqual(
  v1: Vector,
  v2: Vector,
  lambda: number = 0
): boolean {
  return v1.every((comp, i) => Math.abs(comp - (v2[i] || 0)) <= lambda);
}

export function vectorCopy(v: Vector): Vector {
  return [...v];
}

export function vectorMag(v: Vector): number {
  return Math.sqrt(vectorMagSquared(v));
}

export function vectorMagSquared(v: Vector): number {
  return v.reduce((sum, comp) => sum + comp * comp, 0);
}

export function vectorSum(v: Vector): number {
  return v.reduce((acc, comp) => acc + comp, 0);
}

export function vectorGet(v: Vector, i: number): number {
  return v[i];
}

export function vectorSet(v: Vector, i: number, val: number): Vector {
  const newVector = [...v];
  newVector[i] = val;
  return newVector;
}

export function vectorSlice(v: Vector, start: number, end: number): Vector {
  return v.slice(start, end);
}

export function vectorToColumnMatrix(v: Vector): number[][] {
  return v.map((comp) => [comp]);
}

export function vectorToRowMatrix(v: Vector): number[][] {
  return [v];
}

export function vectorX(v: Vector): number {
  return v[0];
}

export function vectorSetX(v: Vector, value: number): Vector {
  return vectorSet(v, 0, value);
}

export function vectorY(v: Vector): number {
  return v[1];
}

export function vectorSetY(v: Vector, value: number): Vector {
  return vectorSet(v, 1, value);
}

export function vectorZ(v: Vector): number {
  return v[2];
}

export function vectorSetZ(v: Vector, value: number): Vector {
  return vectorSet(v, 2, value);
}

export function vectorSetW(v: Vector, value: number): Vector {
  return vectorSet(v, 3, value);
}
