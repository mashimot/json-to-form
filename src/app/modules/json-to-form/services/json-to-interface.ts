import { __ARRAY__ } from '../enums/reserved-name.enum';
import { VALUE_TYPES } from './angular/models/value.type';
import { ValueAnalyzer } from './angular/value-analyzer';

export type InterfaceMap = Map<string, string>;

export function jsonToTsInterface(json: any, rootName = ['Root']): string {
  const interfaces: InterfaceMap = new Map();

  function resolveInterfaceName(name: string[]): string[] {
    return name
      .map((segment) => (segment === __ARRAY__ ? 'At' : segment))
      .map((segment) => pascalCase(segment));
  }

  function resolveType(value: any, key: string[]): string {
    const valueType = ValueAnalyzer.getValueType(value);

    if (valueType === VALUE_TYPES.ARRAY) {
      return resolveArrayType(value, key);
    }

    if (valueType === VALUE_TYPES.OBJECT && value !== null) {
      const interfaceName = resolveInterfaceName(key).join('');
      buildInterface(key, value);
      return interfaceName;
    }

    return typeof value;
  }

  function resolveArrayType(arr: unknown[], key: string[]): string {
    const normalizedValue = ValueAnalyzer.normalizeValue(arr);
    const { depth, value } = unwrapArray(normalizedValue);

    const baseType = resolveType(value, [...key, ...Array(depth).fill(__ARRAY__)]);

    return `${baseType}${'[]'.repeat(depth)}`;
  }

  function unwrapArray(input: unknown): { depth: number; value: unknown } {
    let depth = 0;

    depth++;
    const [firstElement] = ValueAnalyzer.normalizeValue(input);

    return { depth, value: firstElement };
  }

  function buildInterface(name: string[], obj: Record<string, any>): void {
    const interfaceName = resolveInterfaceName(name).join('');

    if (interfaces.has(interfaceName)) return;

    const interfaceBody: string[] = [];

    for (const key in obj) {
      const value = obj[key];
      const fullKeyPath = [...name, key];
      const type = resolveType(value, fullKeyPath);
      interfaceBody.push(`${key}: ${type};`);
    }

    interfaces.set(
      interfaceName,
      [`interface ${interfaceName} {`, ...interfaceBody, `}`].join('\n'),
    );
  }

  buildInterface(rootName, json);

  return Array.from(interfaces.values()).join('\n');
}

function pascalCase(str: string): string {
  return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}
