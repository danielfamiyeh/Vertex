import { Triangle } from '../../graphics/triangle/Triangle';
import { Vector } from '../vector/Vector';
import { ClipMap, LinePlaneIntersection } from './Plane.types';

export class Plane {
  private _d: number;

  constructor(private _point: Vector, private _normal: Vector) {
    this._normal.normalize();
    this._d = _point.dot(this.normal);
  }

  /**
   * Generates a Plane object from three position vectors
   *
   * @param {Vector} p    Arbitrary point to be used as a reference
   * @param {Vector} q    Destination point used to construct a vector in the plane
   * @param {Vector} r    Destination point used to construct a vector in the plane
   * @returns {Plane}     Plane constructed from three position vectors
   */
  static fromPoints(p: Vector, q: Vector, r: Vector): Plane {
    const position = p.copy();
    const pq = q.copy().sub(p);
    const pr = r.copy().sub(p);

    const normal = pq.cross(pr);

    return new Plane(position, normal);
  }

  /**

  /**
   * Finds the point at which a ray intersects a plane
   * https://en.wikipedia.org/wiki/Line–plane_intersection
   *
   * @param {Vector} startPoint   Start coordinate of ray
   * @param {Vector} endPoint     End coordiante of ray
   * @returns {Vector | null}     Returns Vector if ray intersects plane, else null
   */
  intersectRay(
    startPoint: Vector,
    endPoint: Vector
  ): LinePlaneIntersection | null {
    const ray = Vector.sub(endPoint, startPoint).normalize();
    const bottom = ray.dot(this._normal);
    const top = Vector.sub(this._point, startPoint)
      .normalize()
      .dot(this._normal);

    const t = top / bottom;

    return { t, ray: ray.scale(t) };
  }

  /**
   * Determines a points distance from closest point of a plane
   *
   * @param {Vector} point Position vector representing a point in 3D space
   * @returns {number}     Distance from plane in arbitrary units
   */
  pointDistance(point: Vector): number {
    return (this.normal.dot(point) + this.d) / this.normal.mag;
  }

  /**
   * Clips triangles against plane
   *
   * @param {Triangle} input      Triangle to clip against plane
   * @returns {Array<Triangle>}   Array of triangles produced by clipping input
   */
  clipTriangle(input: Triangle): Triangle[] {
    const newTriangles: Triangle[] = [];
    const points: ClipMap = {
      inside: [],
      outside: [],
    };
    const texturePoints: ClipMap = {
      inside: [],
      outside: [],
    };

    const distances = input.points.map((point) => this.pointDistance(point));

    distances.forEach((dist, i) => {
      const placement = dist >= 0 ? 'inside' : 'outside';
      points[placement].push(input.points[i]);
      texturePoints[placement].push(input.texturePoints[i]);
    });

    switch (points.inside.length) {
      case 1: {
        // Clip triangle against ray of intersection
        const newPoints: Vector[] = [];
        const newTexturePoints: Vector[] = [];

        // Preserve inside point
        newPoints.push(points.inside[0]);
        input.hasTexture && newTexturePoints.push(texturePoints.inside[0]);

        // Get new points based on ray intersection from preserved point and plane
        points.outside.forEach((point, i) => {
          const { ray: newPoint, t } =
            this.intersectRay(newPoints[0], point) ?? {};
          if (newPoint) {
            newPoints.push(newPoint);
            // This nesting is getting janky :/
            input.hasTexture &&
              newTexturePoints.push(
                Vector.add(
                  newTexturePoints[0],
                  Vector.scale(
                    Vector.sub(texturePoints.outside[i], newTexturePoints[0]),
                    t ?? 1
                  )
                )
              );
          }
        });

        newTriangles.push(
          new Triangle(newPoints, input.color, input.style, newTexturePoints)
        );
        break;
      }

      case 2: {
        /**
         * Two points lie inside plane so clip triangle against plane
         * Split quad formed by clipping into two triangles
         */

        const newPoints1 = input.points.map((point) => point.copy());
        const newPoints2 = input.points.map((point) => point.copy());

        const newTexturePoints1 = input.texturePoints.map((point) =>
          point.copy()
        );
        const newPointsTexture2 = input.texturePoints.map((point) =>
          point.copy()
        );

        // First triangle has two inside points and one at plane intersection
        newPoints1[0] = points.inside[0];
        newPoints1[1] = points.inside[1];
        const { ray: ray1, t: t1 } =
          this.intersectRay(points.inside[0], points.outside[0]) ?? {};
        newPoints1[2] = ray1 as Vector;

        if (input.hasTexture) {
          newTexturePoints1[0] = texturePoints.inside[0];
          newTexturePoints1[1] = texturePoints.inside[1];
          newTexturePoints1[1] = Vector.add(
            texturePoints.inside[0],
            Vector.scale(
              Vector.sub(texturePoints.outside[0], texturePoints.inside[0]),
              t1 ?? 1
            )
          );
        }

        /**
         * Second triangle is defined by one inside point, the clipped point of the other triangle
         * and a new clipped point on the other side of the triangle
         */
        newPoints2[0] = points.inside[1];
        newPoints2[1] = newPoints1[2];
        newPoints2[2] = this.intersectRay(points.inside[1], points.outside[0])
          ?.ray as Vector;

        if (input.hasTexture) {
          newTexturePoints1[0] = texturePoints.inside[1];
          newTexturePoints1[1] = texturePoints.inside[2];
          newTexturePoints1[2] = Vector.add(
            texturePoints.inside[0],
            Vector.scale(
              Vector.sub(texturePoints.outside[0], texturePoints.inside[1]),
              t1 ?? 1
            )
          );
        }

        newTriangles.push(
          new Triangle(newPoints1, input.color, input.style, newTexturePoints1)
        );
        newTriangles.push(
          new Triangle(newPoints2, input.color, input.style, newPointsTexture2)
        );
        break;
      }

      case 3: {
        newTriangles.push(input);
        break;
      }
    }

    return newTriangles;
  }

  get point() {
    return this._point;
  }

  get normal() {
    return this._normal;
  }

  get d() {
    return this._d;
  }
}
