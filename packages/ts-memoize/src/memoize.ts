export function memoize<Args extends unknown[], Result>(
  func: (...args: Args) => Result,
) {
  let prevArgs: string;
  let prevValue: Result;

  return (...args: Args): Result => {
    const currentArgs = serializeArgs(args);
    if (prevArgs === currentArgs) {
      return prevValue;
    }

    const currentValue = func(...args);

    prevArgs = currentArgs;
    prevValue = currentValue;
    return prevValue;
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
