import { __ARRAY__ } from '@app/modules/json-to-form/enums/reserved-name.enum';
import { PathSegmentInterface } from '@app/modules/json-to-form/interfaces/path-segment.interface';
import { FormBuilder, FormStructure } from '../function-definition';
import { VALUE_TYPES, ValueType } from '../models/value.type';
import { ValueAnalyzer } from '../value-analyzer';

export interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType;
  fullKeyPath: PathSegmentInterface['pathKey'][];
  currentFormStructure: FormStructure;
  previousValueType: ValueType;
  formStructureStack: FormStructure[];
  nameDotNotation: string;
  pathSegments: PathSegmentInterface[];
}

export abstract class ValidatorProcessorBase {
  public formContext: { [key: string]: { getters: string; creaters?: string } } = {};

  public process(
    object: { [key: string]: any },
    pathSegments: PathSegmentInterface[] = [],
    previousValueType: any = VALUE_TYPES.OBJECT,
    formStructureStack: FormStructure[] = [],
  ): string[] {
    const results: string[] = [];

    for (const key in object) {
      const value = object[key];
      const normalizedValue = ValueAnalyzer.normalizeValue(value);
      const currentValueType = ValueAnalyzer.getValueType(normalizedValue);
      const remainingPathSegments = ValueAnalyzer.buildPathSegments(
        key,
        pathSegments,
        currentValueType,
      );
      const mergedPathSegments = [...pathSegments, ...remainingPathSegments];
      const fullKeyPath = mergedPathSegments.map((path) => path.pathKey);
      const currentFormStructure = new FormBuilder(mergedPathSegments).formStructure();

      const nameDotNotation = this.buildNameDotNotation(fullKeyPath).join('.');

      const fullContext = {
        key,
        value: normalizedValue,
        currentValueType,
        fullKeyPath,
        currentFormStructure,
        previousValueType,
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
}
