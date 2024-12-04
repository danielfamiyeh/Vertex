import { Triangle } from '../../graphics/triangle/Triangle';
import { Vector, vectorDot, vectorLerp, vectorSub } from '../vector/Vector';

export type Plane = [Vector, Vector];

export function planePoint(p: Plane) {
  return p[0];
}

export function planeNormal(p: Plane) {
  return p[1];
}

export function planePointDistance(p: Plane, v: Vector) {
  const [point, normal] = p;
  return vectorDot(vectorSub(point, v), normal);
}

export function linePlaneIntersection(
  p: Plane,
  lineStart: Vector,
  lineEnd: Vector
) {
  /**
   * Writing this here so I can read it until it's burned into my retinas
   *
   * We want to find the point where d(p) = 0
   * Recall: d(p) = n(p - p0)                         (Literally just the projection of the plane normal onto the distance vector)
   * Recall: p(t) = v1 + t(v2-v1)                     (Literally just linear interpolation)
   * So that: d(p(t)) = n(v1 + t(v2-v1)) - p0) = 0    (Literally just substitution)
   * ==>: n(v1 - p0) + (t)(n)(v2-v1)                  (Literally just rearranging)
   * ==>: -d1/d2-d1                                   (Come on bro, it's not even hard)
   */
  const dStart = planePointDistance(p, lineStart);
  const dEnd = planePointDistance(p, lineEnd);

  const lambda = -dStart / (dEnd - dStart);
  const pointOfIntersection = vectorLerp(lineStart, lineEnd, lambda);

  return { pointOfIntersection, lambda };
}

export function planeClipTriangle(p: Plane, t: Triangle) {
  const insidePoints: Vector[] = [];
  const outsidePoints: Vector[] = [];

  const insideTexturePoints: Vector[] = [];
  const outsideTexturePoints: Vector[] = [];

  t.points.forEach((v, i) => {
    if (planePointDistance(p, v) <= 0) {
      insidePoints.push(v);
      if (t.hasTexture) insideTexturePoints.push(t.texturePoints[i]);
    } else {
      outsidePoints.push(v);
      if (t.hasTexture) outsideTexturePoints.push(t.texturePoints[i]);
    }
  });

  switch (insidePoints.length) {
    case 1: {
      // Then the new geometry is the original point
      // + the two points that are at the plane intersection
      const [startPoint] = insidePoints;
      const [endPoint1, endPoint2] = outsidePoints;

      const [texelStartPoint] = insideTexturePoints;
      const [texelEndPoint1, texelEndPoint2] = outsideTexturePoints;

      const { pointOfIntersection: newPoint1, lambda: lambda1 } =
        linePlaneIntersection(p, startPoint, endPoint1);
      const { pointOfIntersection: newPoint2, lambda: lambda2 } =
        linePlaneIntersection(p, startPoint, endPoint2);

      return [
        new Triangle(
          [startPoint, newPoint1, newPoint2],
          t.color,
          t.style,
          t.hasTexture
            ? [
                texelStartPoint,
                vectorLerp(texelStartPoint, texelEndPoint1, lambda1),
                vectorLerp(texelStartPoint, texelEndPoint2, lambda2),
              ]
            : t.texturePoints
        ),
      ];
    }

    case 2: {
      // Our plane intersection forms a quadrilateral with the two inside points

      const [insidePoint1, insidePoint2] = insidePoints;
      const [outsidePoint] = outsidePoints;

      const [texelInsidePoint1, texelInsidePoint2] = insideTexturePoints;
      const [texelOutsidePoint] = outsideTexturePoints;

      const { pointOfIntersection: pointIntersect1, lambda: lambda1 } =
        linePlaneIntersection(p, insidePoint1, outsidePoint);
      const { pointOfIntersection: pointIntersect2, lambda: lambda2 } =
        linePlaneIntersection(p, insidePoint2, outsidePoint);

      const texelPointIntersect1 = t.hasTexture
        ? vectorLerp(texelInsidePoint1, texelOutsidePoint, lambda1)
        : null;
      const texelPointIntersect2 = t.hasTexture
        ? vectorLerp(texelInsidePoint2, texelOutsidePoint, lambda2)
        : null;

      return [
        new Triangle(
          [insidePoint1, pointIntersect1, insidePoint2],
          t.color,
          t.style,
          // @ts-ignore
          t.hasTexture
            ? [texelInsidePoint1, texelPointIntersect1, texelInsidePoint2]
            : t.texturePoints
        ),
        new Triangle(
          [pointIntersect1, insidePoint2, pointIntersect2],
          t.color,
          t.style,
          // @ts-ignore
          t.hasTexture
            ? [texelInsidePoint2, texelPointIntersect1, texelPointIntersect2]
            : t.texturePoints
        ),
      ];
    }

    case 3:
      return [t];

    default:
      return [];
  }
}
