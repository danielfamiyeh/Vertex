let printed = false;

export function printOnce(message: any) {
  !printed && console.log(message);
  printed = true;
}
