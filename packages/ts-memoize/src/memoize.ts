export function memoize<Args extends unknown[], Result>(
  func: (...args: Args) => Result,
) {
  let prevArgs: string | undefined;
  let prevValue: Result | undefined;

  return (...args: Args): Result => {
    const currentArgs = serializeArgs(args);
    if (prevArgs !== undefined && prevArgs === currentArgs) {
      return prevValue as Result;
    }

    const currentValue = func(...args);

    prevArgs = currentArgs;
    prevValue = currentValue;

    if (currentValue instanceof Promise) {
      currentValue.catch(() => {
        if (prevArgs === currentArgs && prevValue === currentValue) {
          prevArgs = undefined;
          prevValue = undefined;
        }
      });
    }

    return currentValue;
  };
}

function serializeArgs(args: unknown[]) {
  return JSON.stringify(args, (_key, value) => serializeValue(value));
}

function serializeValue(value: unknown) {
  if (value === undefined) {
    return { __tsMemoizeType: 'undefined' };
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return { __tsMemoizeType: 'NaN' };
    }

    if (value === Infinity) {
      return { __tsMemoizeType: 'Infinity' };
    }

    if (value === -Infinity) {
      return { __tsMemoizeType: '-Infinity' };
    }
  }

  return value;
}
