export function Catch (callback: Function) {
  try {
    callback()
  } catch (e) {
    console.log(e);
  }
}