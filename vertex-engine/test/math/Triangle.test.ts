import assert from 'assert';
import { Vector } from '../../src/api/math/vector/Vector';
import { Triangle } from '../../src/api/graphics/triangle/Triangle';

describe('Triangle test suite', () => {
  it('should calculate barycentric coordinates', () => {
    const p1 = new Vector(0, 0);
    const p2 = new Vector(1, 0);
    const p3 = new Vector(0, 1);

    const triangle = new Triangle([p1, p2, p3], '', 'stroke');

    const p = new Vector(0.25, 0.25);
    const subtriangleAreas = [0.25, 0.125, 0.125];
    const tSubtriangleAreas = triangle.subTriangleAreas(p);

    console.log(tSubtriangleAreas);
    subtriangleAreas.forEach((a, i) => {
      assert.equal(a, tSubtriangleAreas[i]);
    });

    assert.equal(0.5, triangle.area);
    assert.equal(
      1,
      triangle.barycentricCoordinates(p).reduce((a, b) => a + b, 0)
    );
  });
});
