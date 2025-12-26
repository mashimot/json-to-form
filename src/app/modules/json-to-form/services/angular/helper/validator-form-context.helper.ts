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

export abstract class ValidatorProcessorBase {
  public formContext: { [key: string]: { getters: string; creaters?: string } } = {};

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
    const modifiers: PathSegmentInterface[] = [];
    const previous = pathSegments?.[pathSegments.length - 1]?.pathType === VALUE_TYPES.ARRAY;

    modifiers.push({
      pathKey: previous ? __ARRAY__ : currentKey,
      pathType: currentValueType,
    });

    return [...pathSegments, ...modifiers];
  }

  private getPreviousValueType(pathSegments: PathSegmentInterface[]): ValueType | undefined {
    return pathSegments?.[pathSegments.length - 2]?.pathType;
  }

  private getCurrentValueType(pathSegments: PathSegmentInterface[]): ValueType | undefined {
    return pathSegments?.[pathSegments.length - 1]?.pathType;
  }
}
