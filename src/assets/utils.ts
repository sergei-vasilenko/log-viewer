export const pickBy = <T>(
  object: Record<string, T>,
  predicat: (key: string, value: T) => boolean
): Record<string, T> => {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(object)) {
    if (predicat(key, value as T)) {
      result[key] = value as T;
    }
  }
  return result;
};

export const chankArray = (array: Array<any>, chankSize = 50) => {
  const result = [];
  for (let i = 0; i < array.length; i += chankSize) {
    result.push(array.slice(i, i + chankSize));
  }
  return result;
};
