import { Camera, upVector } from '../../graphics/camera/Camera';
import {
  Vector,
  vectorAdd,
  vectorCross,
  vectorDot,
  vectorMagSquared,
  vectorSub,
} from '../vector/Vector';

// mult3x3
export type Matrix = number[][];

export function matrixCreate(rows: number, cols: number): Matrix {
  const mat: Matrix = [];
  for (let i = 0; i < rows; i++) {
    mat.push(new Array(cols).fill(0));
  }
  return mat;
}

export function matrixIdentity(size: number): Matrix {
  const mat = matrixCreate(size, size);
  for (let i = 0; i < size; i++) {
    mat[i][i] = 1;
  }
  return mat;
}

export function matrixView(camera: Camera): {
  cameraMatrix: Matrix;
  viewMatrix: Matrix;
} {
  const { position, rotation } = camera.body;
  const target = vectorAdd(position, rotation);

  const newZAxis = vectorSub(target, position);
  const newXAxis = vectorCross(upVector, newZAxis);
  const newYAxis = vectorCross(newZAxis, newXAxis);

  const tx = vectorDot(position, newXAxis);
  const ty = vectorDot(position, newYAxis);
  const tz = vectorDot(position, newZAxis);

  const cameraMatrix = matrixIdentity(4);
  const viewMatrix = matrixIdentity(4);

  cameraMatrix[0] = [...newXAxis, tx];
  cameraMatrix[1] = [...newYAxis, ty];
  cameraMatrix[2] = [...newZAxis, tz];
  cameraMatrix[3] = [0, 0, 0, 1];

  viewMatrix[0] = [newXAxis[0], newYAxis[0], newZAxis[0], 0];
  viewMatrix[1] = [newXAxis[1], newYAxis[1], newZAxis[1], 0];
  viewMatrix[2] = [newXAxis[2], newYAxis[2], newZAxis[2], 0];
  viewMatrix[3] = [-tx, -ty, -tz, 1];

  return { cameraMatrix, viewMatrix };
}

export function matrixWorld(
  rotation: Vector = [0, 0, 0],
  translation: Vector = [0, 0, 0]
): Matrix | null {
  if (!(translation || vectorMagSquared(rotation))) return null;

  const xRotation = matrixXRotation(rotation[0]);
  const yRotation = matrixYRotation(rotation[1]);
  const zRotation = matrixZRotation(rotation[2]);
  const _translation = matrixTranslation(translation);

  return matrixMultiply(
    _translation,
    matrixMultiply(xRotation, matrixMultiply(yRotation, zRotation))
  );
}

export function matrixProjection(
  canvasWidth: number,
  canvasHeight: number,
  nearPlane: number,
  farPlane: number,
  fieldOfViewDegrees: number
): { projectionMatrix: Matrix; zOffset: number } {
  const aspectRatio = canvasHeight / canvasWidth;
  const projectionMatrix = matrixIdentity(4);

  const fieldOfViewRadians =
    1 / Math.tan(0.5 * fieldOfViewDegrees * (3.14 / 180));
  const fx = fieldOfViewRadians;
  const fy = fieldOfViewRadians;
  const fz = farPlane / (farPlane - nearPlane);

  projectionMatrix[0][0] = fx;
  projectionMatrix[1][1] = fy;
  projectionMatrix[2][2] = fz;

  return {
    projectionMatrix,
    zOffset: (farPlane * nearPlane) / (farPlane - nearPlane),
  };
}

export function matrixXRotation(angle: number): Matrix {
  const rad = (angle * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  const matrix = matrixIdentity(4);
  matrix[1][1] = c;
  matrix[1][2] = -s;
  matrix[2][1] = s;
  matrix[2][2] = c;

  return matrix;
}

export function matrixYRotation(angle: number): Matrix {
  const rad = (angle * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  const matrix = matrixIdentity(4);
  matrix[0][0] = c;
  matrix[2][2] = c;
  matrix[0][2] = s;
  matrix[2][0] = -s;

  return matrix;
}

export function matrixZRotation(angle: number): Matrix {
  const rad = (angle * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  const matrix = matrixIdentity(4);
  matrix[0][0] = c;
  matrix[1][1] = c;
  matrix[0][1] = -s;
  matrix[1][0] = s;

  return matrix;
}

export function matrixTranslation(distance: Vector): Matrix {
  const matrix = matrixIdentity(4);
  matrix[0][3] = distance[0];
  matrix[1][3] = distance[1];
  matrix[2][3] = distance[2];
  return matrix;
}

export function matrixMultiply(matrixA: Matrix, matrixB: Matrix): Matrix {
  if (matrixA[0].length !== matrixB.length)
    throw new Error(`Cannot multiply matrices: incompatible dimensions`);

  const result: Matrix = matrixCreate(matrixA.length, matrixB[0].length);

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixA[0].length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

export function matrixEquals(matrixA: Matrix, matrixB: Matrix): boolean {
  if (
    matrixA.length !== matrixB.length ||
    matrixA[0].length !== matrixB[0].length
  )
    return false;

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixA[0].length; j++) {
      if (matrixA[i][j] !== matrixB[i][j]) return false;
    }
  }

  return true;
}

export function matrixToColumnVector(matrix: Matrix): Vector {
  if (matrix[0].length !== 1) throw new Error(`Matrix is not a column vector`);
  return matrix.map((row) => row[0]);
}

export function matrixToRowVector(matrix: Matrix): Vector {
  if (matrix.length !== 1) throw new Error(`Matrix is not a row vector`);
  return matrix[0];
}

export function matrixToVector(matrix: Matrix): Vector {
  return matrix.length === 1
    ? matrixToRowVector(matrix)
    : matrixToColumnVector(matrix);
}
