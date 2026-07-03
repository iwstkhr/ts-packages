export function memoize<Args extends unknown[], Result>(
  func: (...args: Args) => Result,
) {
  let prevArgs: string;
  let prevValue: Result;

  return (...args: Args): Result => {
    const currentArgs = JSON.stringify(args);
    if (prevArgs === currentArgs) {
      return prevValue;
    }

    const currentValue = func(...args);

    prevArgs = currentArgs;
    prevValue = currentValue;
    return prevValue;
  };
}
