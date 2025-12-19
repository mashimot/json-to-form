import { camelCasedString } from '@app/shared/utils/string.utils';
import { __ARRAY__ } from '../../enums/reserved-name.enum';
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
  fullKeyPath: (string | null)[];
  index: string;
  previousValueType: string;
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
  constructor(
    private fullKeyPath: (string | null)[] = [],
    private previousValueType: ValueType,
    private currentValueType?: ValueType | undefined,
  ) {}

  private get hasArrayInPath(): boolean {
    const hasAnyArrayElement = this.fullKeyPath.includes(__ARRAY__);
    return (
      hasAnyArrayElement ||
      this.currentValueType === VALUE_TYPES.ARRAY ||
      this.previousValueType === VALUE_TYPES.ARRAY
    );
  }

  private generateMethodFromKeypath(): MethodFromKeypath {
    const { methodName, params, path, reactiveFormType } = this.getAccessors();

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

  private getAccessors(): Accessors {
    const suffixArray = 'At';
    const indexerPreffix = 'index';
    const reactiveFormType = this.getReactiveFormType();

    const methodName = this.uncapitalize(
      this.fullKeyPath
        .map((value) => (value === __ARRAY__ ? suffixArray : value))
        .map((value) => this.capitalize(value as string))
        .join(''),
    );

    const { path, paramCounter } = this.fullKeyPath.reduce(
      (acc, value: string | null) => {
        if (value === __ARRAY__) {
          acc.path.push(`${indexerPreffix}${acc.paramCounter}`);
          acc.paramCounter++;
        } else {
          acc.path.push(`'${value}'`);
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
    const baseName = camelCasedString(this.fullKeyPath.join('.'), true);
    return suffix > 0 ? `${baseName}${suffix}` : baseName;
  }

  public formStructure(): FormStructure {
    const accessors = this.getAccessors();

    return {
      ...accessors,
      attributeName: this.getAttributeName(accessors.paramCounter),
      fullKeyPath: this.fullKeyPath,
      previousValueType: this.previousValueType,
      currentValueType: this.currentValueType,
      ...this.generateMethodFromKeypath(),
    };
  }

  private getReactiveFormType(): string {
    const map: Record<string, string> = {
      array: 'FormArray',
      object: 'FormGroup',
      string: 'FormControl',
    };

    return map[this.currentValueType!] ?? '';
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
