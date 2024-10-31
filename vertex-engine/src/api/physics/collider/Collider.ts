export interface Collider {
  isActive: boolean;
  isColliding: boolean;
  callback: Function;
  handleCollision(): boolean;
}
