import { camelCasedString } from '@app/shared/utils/string.utils';
import { __ARRAY__ } from '../../enums/reserved-name.enum';
import { PathSegmentInterface } from '../../interfaces/path-segment.interface';
import { VALUE_TYPES, ValueType } from './models/value.type';

export type PathInput = string;
export type Operation = 'get' | 'create';
export type MethodSuffixMap = Record<Operation, 'getter' | 'creator'>;
export interface Accessors {
  methodName: string;
  params: string[];
  index: string;
  lastParam?: string;
  lastIndexParam: string;
  path: string[];
  reactiveFormType: string;
  paramCounter: number;
}

export interface FormStructure extends Accessors, MethodFromKeypath {
  attributeName: string;
  pathSegments: (string | null)[];
  index: string;
  previousValueType: string | undefined;
  currentValueType?: string;
}

export interface MethodFromKeypath {
  getter: {
    name: string;
    call: string;
    withReturn: string;
  };
  creator: {
    name: string;
    call: string;
    withReturn: (content: string[]) => string;
  };
}

export interface GeneratedMethod {
  name: string;
  call: string;
  previousCall: string;
  withReturn: string;
}

export class CodeTemplateGenerator {
  public static createTemplate(
    name: string,
    reactiveFormType: string,
    content: string[] = [],
  ): string[] {
    return [`${name}(): ${reactiveFormType} {`, `  return ${content.join('\n')};`, `}`];
  }
}

export class FormBuilder {
  constructor(private mergePathSegments: PathSegmentInterface[] = []) {}

  private readonly INDEX_PREFIX = 'index';
  private readonly ARRAY_TOKEN = __ARRAY__;
  private readonly REACTIVE_FORM_TYPE_MAP: Record<string, string> = {
    array: 'FormArray',
    object: 'FormGroup',
    string: 'FormControl',
  };

  private get pathSegments(): (string | null)[] {
    return this.mergePathSegments.map((path) => path.pathKey);
  }

  private get previousValueType(): ValueType | undefined {
    return this.mergePathSegments?.[this.mergePathSegments.length - 2]?.pathType;
  }

  private get currentValueType(): ValueType | undefined {
    return this.mergePathSegments?.[this.mergePathSegments.length - 1]?.pathType;
  }

  private get hasArrayInPath(): boolean {
    return (
      this.pathSegments.includes(this.ARRAY_TOKEN) ||
      this.currentValueType === VALUE_TYPES.ARRAY ||
      this.previousValueType === VALUE_TYPES.ARRAY
    );
  }

  private generateMethodFromKeypath(): MethodFromKeypath {
    const { methodName, params, path, reactiveFormType } = this.buildAccessors();

    const capitalized = this.capitalize(methodName);
    const uncapitalized = this.uncapitalize(methodName);

    const accessorName = this.hasArrayInPath ? `get${capitalized}` : `get ${uncapitalized}`;
    const accessorCallName = this.hasArrayInPath ? accessorName : uncapitalized;

    const createFunctionName = `create${capitalized}`;

    return {
      getter: {
        name: accessorName,
        call: this.buildFunctionCall(accessorCallName, params),
        withReturn: this.buildFunctionWithReturn(
          'get',
          accessorName,
          params,
          path,
          reactiveFormType,
        ),
      },
      creator: {
        name: createFunctionName,
        call: this.buildFunctionCall(createFunctionName, []),
        withReturn: (content: string[]) => {
          return this.buildFunctionWithReturn(
            'create',
            createFunctionName,
            params,
            path,
            reactiveFormType,
            content,
          );
        },
      },
    };
  }

  private buildFunctionWithReturn(
    operation: string,
    name: string,
    params: string[],
    pathArray: string[],
    reactiveFormType: string,
    content: string[] = [],
  ): string {
    const paramListTyped = params.map((p) => `${p}:number`).join(', ');

    if (operation === 'create') {
      return CodeTemplateGenerator.createTemplate(name, reactiveFormType, content).join('\n');
    }

    if (operation === 'get') {
      return [
        `${name}(${paramListTyped}): ${reactiveFormType} {`,
        `return this.f.get([${pathArray.join(', ')}]) as ${reactiveFormType};`,
        `}`,
      ].join('\n');
    }

    return `${name}(${paramListTyped}) { /* ${operation} logic here */ }`;
  }

  private buildAccessors(): Accessors {
    const suffixArray = 'At';
    const indexerPreffix = 'index';
    const reactiveFormType = this.resolveReactiveType();

    const methodName = this.uncapitalize(
      this.mergePathSegments
        .map((segment, index) => {
          if (index - 1 >= 0) {
            const previousType = this.mergePathSegments[index - 1]?.pathType;
            return previousType === VALUE_TYPES.ARRAY ? suffixArray : segment.pathKey;
          }

          return segment.pathKey;
        })
        .map((value) => this.capitalize(value as string))
        .join(''),
    );

    const { path, paramCounter } = this.mergePathSegments.reduce(
      (acc, item: PathSegmentInterface, index: number) => {
        if (index >= 0) {
          const previousType = this.mergePathSegments[index - 1]?.pathType;
          if (previousType === VALUE_TYPES.ARRAY) {
            acc.path.push(`${indexerPreffix}${acc.paramCounter}`);
            acc.paramCounter++;
          } else {
            acc.path.push(`'${item.pathKey}'`);
          }
        }

        return acc;
      },
      { path: [] as string[], paramCounter: 0 },
    );

    const paramList = [...Array(paramCounter).keys()].map((index) => `${indexerPreffix}${index}`);

    return {
      methodName,
      params: paramList,
      index: path?.[path.length - 1],
      lastIndexParam:
        this.currentValueType === VALUE_TYPES.ARRAY ? `${indexerPreffix}${paramCounter}` : '',
      path: path,
      reactiveFormType,
      paramCounter,
    };
  }

  private getAttributeName(suffix: number = 1): string {
    const baseName = camelCasedString(this.pathSegments.join('.'), true);
    return suffix > 0 ? `${baseName}${suffix}` : baseName;
  }

  public formStructure(): FormStructure {
    const accessors = this.buildAccessors();

    return {
      ...accessors,
      attributeName: this.getAttributeName(accessors.paramCounter),
      pathSegments: this.pathSegments,
      previousValueType: this.previousValueType,
      currentValueType: this.currentValueType,
      ...this.generateMethodFromKeypath(),
    };
  }

  private resolveReactiveType(): string {
    return this.REACTIVE_FORM_TYPE_MAP[this.currentValueType!] ?? '';
  }

  private create(name: string, reactiveFormType: string, content: string[] | undefined): string[] {
    return [`${name}(): ${reactiveFormType} {`, `return ${(content || []).join('\n')};`, `}`];
  }

  private buildFunctionCall(name: string, params: string[]): string {
    return `${name}(${params.join(', ')})`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
