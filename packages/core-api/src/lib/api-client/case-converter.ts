import { camelCase, snakeCase } from 'change-case';

type ConvertableValue = string | number | boolean | null | undefined | Date | ConvertableObject | ConvertableArray;
type ConvertableObject = { [key: string]: ConvertableValue };
type ConvertableArray = ConvertableValue[];

export function toCamelCase<T = any>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return data as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => toCamelCase(item)) as T;
  }

  if (typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const camelKey = camelCase(key);
        converted[camelKey] = toCamelCase((data as any)[key]);
      }
    }
    return converted;
  }

  return data;
}

export function toSnakeCase<T = any>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return data as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => toSnakeCase(item)) as T;
  }

  if (typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Preserve dot notation by converting each part separately
        const snakeKey = key.includes('.')
          ? key.split('.').map(part => snakeCase(part)).join('.')
          : snakeCase(key);
        converted[snakeKey] = toSnakeCase((data as any)[key]);
      }
    }
    return converted;
  }

  return data;
}