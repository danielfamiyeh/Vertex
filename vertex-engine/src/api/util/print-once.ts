let printed = false;

function printOne(message: any) {
  !printed && console.log(message);
  printed = true;
}
