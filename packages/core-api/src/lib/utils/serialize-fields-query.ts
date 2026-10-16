import { FieldQuery } from '../types';
import { snakeCase } from 'change-case';

export function serializeFieldsQuery<T>(fields: FieldQuery<T>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) {
      parts.push(snakeCase(key));
    } else if (typeof value === 'object') {
      let fieldStr = snakeCase(key);

      // Handle nested fields
      if ('fields' in value && value.fields) {
        const subFields = serializeFieldsQuery(value.fields);
        fieldStr += `.fields`;
        if (subFields) {
          fieldStr += `(${subFields})`;
        }
      }

      // Handle any other properties dynamically
      for (const [propKey, propValue] of Object.entries(value)) {
        if (propKey !== 'fields' && propValue !== undefined) {
          fieldStr += `.${snakeCase(propKey)}(${propValue})`;
        }
      }

      parts.push(fieldStr);
    }
  }

  return parts.join(',');
}

