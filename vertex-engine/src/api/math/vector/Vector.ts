import { Matrix } from '../matrix/Matrix';

export class Vector {
  dim: number;
  comps: Array<number>;

  constructor(...args: number[]) {
    this.dim = args.length;
    this.comps = args.map((num) => num);
  }

  toString() {
    return `v(${this.comps.toString()})`;
  }

  static uniform(num: number, dim: number) {
    return new Vector(...new Array(dim).fill(num));
  }

  /**
   * Returns a zero vector of a given length
   *
   * @param {number} dim Length of vector
   * @returns {Vector}   Zero vector
   */
  static zeroes(dim: number): Vector {
    return new Vector(...Array(dim).fill(0));
  }

  /**
   * Adds two vectors together, out-of-place
   * @param {Vector} v1 Vector 1
   * @param {Vector} v2 Vector 2
   * @returns {Vector} Sum of vectors
   */
  static add(...vectors: Vector[]): Vector {
    vectors[0] = vectors[0].copy();
    return vectors.reduce((a, b) => a.add(b));
  }

  /**
   * Subtracts two vectors, out-of-place
   * @param {Vector} v1 Vector 1
   * @param {Vector} v2 Vector 2
   * @returns {Vector} Difference of vectors
   */
  static sub(v1: Vector, v2: Vector): Vector {
    return new Vector(...v1.comps.map((comp, i) => comp - v2.get(i)));
  }

  /**
   * Normalizes a vector, out-of-place
   * @param {Vector} v Vector to normalize
   * @returns Normalized vector
   */
  static normalize(v: Vector): Vector {
    const mag = v.mag;
    return new Vector(...v.comps.map((comp) => comp / mag));
  }

  /**
   * Divides a vector by a scalar, out-of-place
   * @param {Vector} v Vector to divide
   * @param {number} lambda Scalar to divide by
   * @returns {Vector} Divided vector
   */
  static div(v: Vector, lambda: number): Vector {
    return new Vector(...v.comps.map((comp) => comp / lambda));
  }

  /**
   * Scale a vector by a scalar, out-of-place
   * @param {Vector} v Vector to scale
   * @param {number} lambda Scalar to scale by
   * @returns {Vector} Scaled vector
   */
  static scale(v: Vector, lambda: number): Vector {
    return new Vector(...v.comps.map((comp) => (!comp ? comp : comp * lambda)));
  }

  /**
   * Extends a vector with additional components, out-of-place
   * @param {Vector} v Vector to extend
   * @param {...number} components Components to add
   * @returns {Vector} Extended vector
   */
  static extended(v: Vector, ...components: number[]): Vector {
    return new Vector(...v.comps.concat(components));
  }

  /**
   * Returns the sum with another vector
   *
   * @param {Vector} v Another vector
   * @returns {Vector} Vector sum
   */
  add(...vectors: Vector[]): Vector {
    vectors.forEach((v) => {
      for (let i = 0; i < this.dim; i++) {
        this.comps[i] += v.get(i);
      }
    });

    return this;
  }

  /**
   * Returns the difference with another vector
   *
   * @param {Vector} v Another vector
   * @returns {Vector} Vector difference
   */
  sub(v: Vector): Vector {
    for (let i = 0; i < this.dim; i++) {
      this.comps[i] -= v.get(i);
    }

    return this;
  }

  /**
   * Returns the scalar product with another vector
   *
   * @param {Vector} v Another vector
   * @returns {number} Scalar product
   */
  dot(v: Vector): number {
    return this.comps
      .map((comp, i) => comp * v.get(i))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Returns the vector product another vector
   *
   * @param {Vector} v Another vector
   * @returns {Vector} Vector product
   */
  cross(v: Vector): Vector {
    const a = this.comps;
    const b = v.comps;

    const i = a[1] * b[2] - a[2] * b[1];
    const j = a[0] * b[2] - a[2] * b[0];
    const k = a[0] * b[1] - a[1] * b[0];

    return new Vector(i, j === 0 ? j : -j, k);
  }

  /**
   * Determines with two vectors are equal, allowing for some error
   *
   * @param {Vector} v Another vector
   * @param {number} lambda Margin of error
   * @returns {boolean} True if vectors are equal, else false
   */
  isEqual(v: Vector, lambda: number = 0): boolean {
    let count = 0;
    this.comps.forEach(
      (comp, i) => (count += +(Math.abs(comp - v.get(i)) <= lambda))
    );
    return count === this.dim;
  }

  /**
   * Returns a copy of the vector object
   *
   * @returns {Vector} Copy of vector object
   */
  copy(): Vector {
    return new Vector(...this.comps);
  }

  /**
   * Returns normalized vector
   *
   * @returns {Vector} Vector with a magintude of 1
   */
  normalize(): Vector {
    const mag = this.mag;
    this.comps = this.comps.map((comp) => comp / (mag || 1));

    return this;
  }

  /**
   * Returns a vector with components scaled by a constant λ
   *
   * @param {number} lambda Constant to scale vector components by
   * @returns {Vector} Scaled vector
   */
  scale(lambda: number): Vector {
    this.comps = this.comps.map((comp) => (!comp ? comp : comp * lambda));
    return this;
  }

  /**
   * Returns a vector with components divided by a constant λ
   *
   * @param {number} lambda Constant to divide vector components by
   * @returns {Vector} Scaled vector
   */
  div(lambda: number): Vector {
    for (let i = 0; i < this.dim; i++) {
      this.comps[i] /= lambda;
    }

    return this;
  }

  /**
   * Extends the vector with additional components
   *
   * @param {...number} components Additional components
   * @returns {Vector} Extended vector
   */
  extend(...components: number[]): Vector {
    this.comps = this.comps.concat(components);
    this.dim = this.comps.length;

    return this;
  }

  /**
   * Calculates the sum of all components
   *
   * @returns {number}  Sum of components
   */
  sum(): number {
    return this.comps.reduce((a, b) => a + b, 0);
  }

  /**
   * Returns component at a given index
   *
   * @param {number} i Index
   * @returns {number} Component at index i
   */
  get(i: number): number {
    return this.comps[i];
  }

  /**
   * Set component at a given index by a given value
   *
   * @param {number} i   Index
   * @param {number} val New value
   */
  set(i: number, val: number): Vector {
    this.comps[i] = val;
    return this;
  }

  slice(start: number, end: number) {
    this.comps = this.comps.slice(start, end);
    this.dim = this.comps.length;
    return this;
  }

  get matrix() {
    let newMat = new Matrix(this.dim, 1);
    for (let i = 0; i < this.dim; i++) {
      newMat.mat[i] = [this.comps[i]];
    }

    return newMat;
  }

  get x() {
    return this.comps[0];
  }

  set x(val: number) {
    this.comps[0] = val;
  }

  get y() {
    return this.comps[1];
  }

  set y(val: number) {
    this.comps[1] = val;
  }

  get z() {
    return this.comps[2];
  }

  set z(val: number) {
    this.comps[2] = val;
  }

  get w() {
    return this.comps[3];
  }

  /**
   * Returns magnitude of vector
   *
   * @returns {number} Vector magnitude
   */
  get mag(): number {
    return Math.sqrt(
      this.comps.map((comp) => comp * comp).reduce((a, b) => a + b)
    );
  }

  get rowMatrix() {
    const matrix = new Matrix(1, this.dim);
    matrix.mat = [[...this.comps]];

    return matrix;
  }

  get columnMatrix() {
    const matrix = new Matrix(this.dim, 1);
    this.comps.forEach((comp, i) => (matrix._mat[i] = [comp]));

    return matrix;
  }
}
