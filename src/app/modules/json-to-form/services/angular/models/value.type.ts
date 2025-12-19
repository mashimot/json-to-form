export const VALUE_TYPES = {
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  STRING: 'string',
  FUNCTION: 'function',
  ARRAY: 'array',
  DATE: 'date',
  REGEXP: 'regExp',
  OBJECT: 'object',
  ERROR: 'error',
  NULL: 'null',
  UNDEFINED: 'undefined',
} as const;

export type ValueType = (typeof VALUE_TYPES)[keyof typeof VALUE_TYPES];
