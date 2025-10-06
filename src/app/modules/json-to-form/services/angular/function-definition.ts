import { __ARRAY__ } from '../../enums/reserved-name.enum';
import { VALUE_TYPES, ValueType } from './models/value.type';
import { ValidatorRuleHelper } from './validator-rule-helper';

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
  stack: (string | null)[];
  paramCounter: number;
}

export interface FormStructure extends Accessors, MethodFromKeypath {
  attributeName: string;
  fullKeyPath: (string | null)[];
  index: string;
  formStructureTemplate: string[];
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
    withReturn: string;
  };
}

export interface GeneratedMethod {
  name: string;
  call: string;
  previousCall: string;
  withReturn: string;
}

export class PathUtils {
  public static getPath(dotNotation: string[]): string[] {
    const id = [...dotNotation];
    let count = 0;
    for (let i = 0; i < id.length; i++) {
      const item = id[i];
      if (item === __ARRAY__) {
        id[i] = this.getIndexName(count);
        count++;
      } else {
        id[i] = `'${item}'`;
      }
    }

    return id;
  }

  public static buildChainedReactiveFormAccess(path: string[]): string[] {
    let count = 0;

    for (let i = 0; i < path.length; i++) {
      const item = path[i];
      if (item === __ARRAY__) {
        const currentParameter = this.getIndexName(count);
        path[i] = ` as FormArray).at(${currentParameter})`;
        count++;
      } else {
        path[i] = `.get('${item}')`;
        if (i === 0) {
          path[i] = `this.form${path[i]}`;
        }
      }
    }

    return path;
  }

  public static getIndexName(count: number): string {
    return `index${(count || 0) + 1}`;
  }
}

export class CodeTemplateGenerator {
  public static createTemplate(
    name: string,
    reactiveFormType: string,
    content: string[] = [],
  ): string[] {
    return [
      `${name}(): ${reactiveFormType} {`,
      `  return ${content.join('\n')};`,
      `}`,
    ];
  }
}

export class FormBuilder {
  constructor(
    private fullKeyPath: (string | null)[] = [],
    private previousValueType: ValueType,
    private currentValueType?: ValueType | undefined,
    private formStructureTemplate?: string[],
  ) {}

  private get hasReservedWord(): boolean {
    return this.fullKeyPath.includes(__ARRAY__);
  }

  private generateMethodFromKeypath(
    stack: (string | null)[],
  ): MethodFromKeypath {
    const { methodName, params, path, reactiveFormType } =
      this.getAccessors(stack);
    const result: MethodFromKeypath = {} as MethodFromKeypath;

    // GETTER
    const capitalized = this.capitalize(methodName);
    const uncapitalized = this.uncapitalize(methodName);

    const getterName = this.hasReservedWord
      ? `get${capitalized}`
      : `get ${uncapitalized}`;

    const callName = this.hasReservedWord ? getterName : uncapitalized;

    result.getter = {
      name: getterName,
      call: this.functionCall(callName, params),
      withReturn: this.generateFunctionWithReturn(
        'get',
        getterName,
        params,
        path,
        reactiveFormType,
      ),
    };

    // CREATOR
    const createFunctionName = `create${this.capitalize(methodName)}`;

    result.creator = {
      name: createFunctionName,
      call: this.functionCall(createFunctionName, []),
      withReturn: this.generateFunctionWithReturn(
        'create',
        createFunctionName,
        params,
        path,
        reactiveFormType,
      ),
    };

    return result;
  }

  private generateFunctionWithReturn(
    operation: string,
    name: string,
    params: string[],
    pathArray: string[],
    reactiveFormType: string,
  ): string {
    const paramListTyped = params.map((p) => `${p}:number`).join(', ');

    if (operation === 'create') {
      return CodeTemplateGenerator.createTemplate(
        name,
        reactiveFormType,
        this.formStructureTemplate || [],
      ).join('\n');
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

  private getAccessors(stack: (string | null)[]): Accessors {
    const path: string[] = [];
    const methodNameParts: string[] = [];
    const paramList: string[] = [];
    const suffixArray = 'At';
    const indexerPreffix = 'index';
    let paramCounter = 0;

    stack.forEach((s: string | null) => {
      if (s === __ARRAY__) {
        methodNameParts.push(suffixArray);
        paramList.push(`${indexerPreffix}${paramCounter}`);
        path.push(`${indexerPreffix}${paramCounter}`);
        paramCounter++;
      } else {
        methodNameParts.push(this.capitalize(s as string));
        path.push(`'${s}'`);
      }
    });

    const methodName = this.uncapitalize(methodNameParts.join(''));
    const reactiveFormType = this.getReactiveFormType();

    return {
      methodName,
      params: paramList,
      index: path?.[path.length - 1],
      lastIndexParam: `${indexerPreffix}${paramCounter}`,
      path,
      reactiveFormType,
      stack,
      paramCounter,
    };
  }

  private getAttributeName(suffix: number = 1): string {
    const baseName = ValidatorRuleHelper.camelCasedString(
      this.fullKeyPath.join('.'),
      true,
    );
    return suffix > 0 ? `${baseName}${suffix}` : baseName;
  }

  public formStructure(): FormStructure {
    const stack = [...this.fullKeyPath];

    if (this.currentValueType === VALUE_TYPES.ARRAY) {
      stack.pop();
    }

    const accessors = this.getAccessors(stack);

    return {
      ...accessors,
      attributeName: this.getAttributeName(accessors.paramCounter),
      fullKeyPath: stack,
      formStructureTemplate: this.formStructureTemplate || [],
      previousValueType: this.previousValueType,
      currentValueType: this.currentValueType,
      ...this.generateMethodFromKeypath(stack),
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

  private create(
    name: string,
    reactiveFormType: string,
    content: string[] | undefined,
  ): string[] {
    return [
      `${name}(): ${reactiveFormType} {`,
      `return ${(content || []).join('\n')};`,
      `}`,
    ];
  }

  private functionCall(name: string, params: string[]): string {
    return `${name}(${params.join(', ')})`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
