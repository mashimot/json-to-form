import { __ARRAY__ } from '@app/modules/json-to-form/enums/reserved-name.enum';
import { PathSegmentInterface } from '@app/modules/json-to-form/interfaces/path-segment.interface';
import { FormBuilder, FormStructure } from '../function-definition';
import { VALUE_TYPES, ValueType } from '../models/value.type';
import { ValueAnalyzer } from '../value-analyzer';

export interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType | undefined;
  fullKeyPath: PathSegmentInterface['pathKey'][];
  currentFormStructure: FormStructure;
  previousValueType: ValueType | undefined;
  formStructureStack: FormStructure[];
  nameDotNotation: string;
  pathSegments: PathSegmentInterface[];
}

// const users = [
//   ['user', 'phone'],
//   ['user', 'address'],
//   ['usEr', 'phone', 'number'],
//   ['user', 'name'],
//   ['uSer', 'pHone'],
//   ['usEr', 'age'],
// ];
// /**
//  * Normaliza e enumera tokens.
//  * @param {Array<Array<string>>} rows - matriz de linhas com tokens.
//  * @param {'reuse'|'enumerate'} mode - modo de mapeamento.
//  * @returns {{ normalizedRows: Array<Array<string>>, mapping: Object }}
//  */
export function normalize(rows: any, mode = 'reuse') {
  const mapping = new Map();
  const used = new Set();
  const counters = new Map();

  const makeBase = (s: any) =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_') || 'x';

  function getNameFor(keyLower: string) {
    if (mapping.has(keyLower)) return mapping.get(keyLower);

    const base = makeBase(keyLower);
    if (mode === 'reuse') {
      let name = base;
      let i = 0;
      while (used.has(name)) {
        i += 1;
        name = base + i;
      }
      mapping.set(keyLower, name);
      used.add(name);
      counters.set(base, (counters.get(base) || 0) + 1);
      return name;
    } else {
      const count = counters.get(base) || 0;
      const name = count === 0 ? base : base + count;
      mapping.set(keyLower, name);
      used.add(name);
      counters.set(base, count + 1);
      return name;
    }
  }

  const normalizedRows = rows.map((row: any[]) =>
    row.map((token) => (token === null ? token : getNameFor(String(token)))),
  );
  return {
    normalizedRows,
    // , mapping: Object.fromEntries(mapping)
  };
}

export abstract class ValidatorProcessorBase {
  public formContext: { [key: string]: { getters: string; creaters?: string } } = {};
  public names: (string | null)[][] = [];

  public process(
    object: { [key: string]: any },
    pathSegments: PathSegmentInterface[] = [],
    formStructureStack: FormStructure[] = [],
  ): string[] {
    const results: string[] = [];

    for (const key in object) {
      const value = object[key];
      const normalizedValue = ValueAnalyzer.normalizeValue(value);
      const currentValueType = ValueAnalyzer.getValueType(normalizedValue);
      const mergedPathSegments = this.buildPathSegments(key, pathSegments, currentValueType);
      const fullKeyPath = mergedPathSegments.map((path) => path.pathKey);
      const currentFormStructure = new FormBuilder(mergedPathSegments).formStructure();
      const nameDotNotation = this.buildNameDotNotation(fullKeyPath).join('.');

      const fullContext = {
        key,
        value: normalizedValue,
        previousValueType: this.getPreviousValueType(mergedPathSegments),
        currentValueType: this.getCurrentValueType(mergedPathSegments),
        fullKeyPath,
        currentFormStructure,
        formStructureStack,
        nameDotNotation,
        pathSegments: mergedPathSegments,
      };

      results.push(this.handleContext(fullContext));
    }

    return results.filter((el) => el);
  }

  public handleContext(context: FormContext): string {
    const { value, currentValueType, fullKeyPath, key } = context;
    return '';
  }

  private buildNameDotNotation(name: (string | typeof __ARRAY__)[]): string[] {
    return name.map((segment) => (segment === null ? 'At' : segment));
  }

  private buildPathSegments(
    currentKey: string,
    pathSegments: PathSegmentInterface[],
    currentValueType: ValueType,
  ): PathSegmentInterface[] {
    const isPreviousArray = this.getCurrentValueType(pathSegments) === VALUE_TYPES.ARRAY;
    const newPathSegment = {
      pathKey: isPreviousArray ? __ARRAY__ : currentKey,
      pathType: currentValueType,
    };

    const mergedPathSegments = [...pathSegments, newPathSegment];

    const fullKeyPath = mergedPathSegments.map((segment) => segment.pathKey);
    this.names.push(fullKeyPath);

    const { normalizedRows } = normalize(this.names, 'reuse');
    const lastNormalizedRow = normalizedRows.at(-1)!;

    return mergedPathSegments.map((segment, index) => ({
      ...segment,
      pathKeyNormalized: lastNormalizedRow[index],
    }));
  }

  private getPreviousValueType(pathSegments: PathSegmentInterface[]): ValueType | undefined {
    return pathSegments?.[pathSegments.length - 2]?.pathType;
  }

  private getCurrentValueType(pathSegments: PathSegmentInterface[]): ValueType | undefined {
    return pathSegments?.[pathSegments.length - 1]?.pathType;
  }
}
