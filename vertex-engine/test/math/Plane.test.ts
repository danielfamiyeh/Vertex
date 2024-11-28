import assert from 'assert';
import { Triangle } from '../../src/api/graphics/triangle/Triangle';
import {
  Plane,
  clipTriangle,
  linePlaneIntersection,
  planePointDistance,
} from '../../src/api/math/plane/Plane';

// Helper function for almost-equal comparisons (to handle floating-point imprecision)
function vectorsAlmostEqual(v1, v2, epsilon = 1e-6) {
  assert.strictEqual(v1.length, v2.length, 'Vector dimensions must match.');
  const boolArr: boolean[] = [];
  for (let i = 0; i < v1.length; i++) {
    boolArr.push(Math.abs(v1[i] - v2[i]) < epsilon);
  }

  assert.strictEqual(
    boolArr.reduce((a, b) => a && b, true),
    true
  );
}

const plane: Plane = [
  [0, 0, 0],
  [0, 1, 0],
];

// Test cases
describe('clipTriangle', () => {
  it('should correctly compute the intersection of a line segment with a plane', () => {
    const lineStart = [1, 1, 1];
    const lineEnd = [1, -1, 1];

    const expectedIntersection = [1, 0, 1];

    const { pointOfIntersection, lambda } = linePlaneIntersection(
      plane,
      lineStart,
      lineEnd
    );

    vectorsAlmostEqual(pointOfIntersection, expectedIntersection),
      assert(
        Math.abs(planePointDistance(plane, pointOfIntersection)) <= 1e-6,
        'Point does not lie on the plane.'
      );
    assert(
      Math.abs(lambda - 0.5) <= 1e-6,
      `Lambda is incorrect. Expected 0.5 but got ${lambda}.`
    );
  });

  it('should return the same triangle when fully inside the plane', () => {
    const triangle = new Triangle(
      [
        [1, 1, 1],
        [-1, 1, 1],
        [0, 1, -1],
      ],
      'red',
      'stroke'
    );

    const result = clipTriangle(plane, triangle);
    assert.strictEqual(result.length, 1);
    result[0].points.forEach((point, i) =>
      vectorsAlmostEqual(point, triangle.points[i])
    );
  });

  it('should return an empty array when fully outside the plane', () => {
    const triangle = new Triangle(
      [
        [1, -1, 1],
        [-1, -1, 1],
        [0, -1, -1],
      ],
      'red',
      'stroke'
    );

    const result = clipTriangle(plane, triangle);
    assert.strictEqual(result.length, 0);
  });

  it('should clip correctly when one vertex is inside', () => {
    const triangle = new Triangle(
      [
        [0, 1, 0],
        [1, -1, 1],
        [-1, -1, -1],
      ],
      'red',
      'stroke'
    );

    const result = clipTriangle(plane, triangle);
    assert.strictEqual(result.length, 1);

    const expectedPoints = [
      [0, 1, 0],
      [0.5, 0, 0.5],
      [-0.5, 0, -0.5],
    ];
    result[0].points.forEach((point, i) =>
      vectorsAlmostEqual(point, expectedPoints[i])
    );
  });

  it('should clip correctly when two vertices are inside', () => {
    const triangle = new Triangle(
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, -1, -1],
      ],
      'red',
      'stroke'
    );

    const result = clipTriangle(plane, triangle);

    assert.strictEqual(result.length, 2);

    const expectedTriangles = [
      [
        [0, 1, 0],
        [0, 0, -0.5],
        [1, 1, 1],
      ],
      [
        [1, 1, 1],
        [0, 0, -0.5],
        [0.5, 0, 0],
      ],
    ];

    result.forEach((tri, i) => {
      tri.points.forEach((point, j) =>
        vectorsAlmostEqual(point, expectedTriangles[i][j])
      );
    });
  });

  it('should handle degenerate cases correctly', () => {
    const plane = [
      [0, 0, 0],
      [0, 1, 0],
    ]; // y = 0
    const triangle = new Triangle(
      [
        [1, 0, 1],
        [-1, 0, 1],
        [0, 0, -1],
      ],
      'red',
      'stroke'
    );

    const result = clipTriangle(plane, triangle);
    assert.strictEqual(result.length, 1);

    const expectedPoints = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 0, -1],
    ];
    result[0].points.forEach((point, i) =>
      vectorsAlmostEqual(point, expectedPoints[i])
    );
  });
});
