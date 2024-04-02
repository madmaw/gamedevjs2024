export function delay(millis: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, millis);
  });
}
