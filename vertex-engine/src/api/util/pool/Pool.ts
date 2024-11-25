export class Pool<T> {
  private _pool: T[] = [];
  private _freeItems: T[] = [];

  constructor(
    private _factory: () => T,
    size: number,
    private _maxSize = size * 2
  ) {
    for (let i = 0; i < size; i++) {
      const item = this._factory();
      this._pool.push(item);
      this._freeItems.push(item);
    }
  }

  get() {
    const item = this._freeItems.pop();
    if (item) return item;

    if (this._pool.length === this._maxSize) {
      // @ts-ignore
      throw new Error(`Ran out of ${this._pool[0].constructor.name}s in pool`);
    }

    const newItem = this._factory();
    this._pool.push(newItem);

    return newItem;
  }

  free(item: T) {
    this._freeItems.push(item);
  }
}
