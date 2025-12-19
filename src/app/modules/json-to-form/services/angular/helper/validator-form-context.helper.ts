import { __ARRAY__ } from '@app/modules/json-to-form/enums/reserved-name.enum';
import { FormBuilder, FormStructure } from '../function-definition';
import { VALUE_TYPES, ValueType } from '../models/value.type';
import { ValueAnalyzer } from '../value-analyzer';

export interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType;
  fullKeyPath: string[];
  currentFormStructure: FormStructure;
  previousValueType: ValueType;
  formStructureStack: FormStructure[];
  nameDotNotation: string;
}

export abstract class ValidatorProcessorBase {
  public formContext: { [key: string]: { getters: string; creaters?: string } } = {};

  public process(
    object: { [key: string]: any },
    namesArr: string[] = [],
    previousValueType: any = VALUE_TYPES.OBJECT,
    formStructureStack: FormStructure[] = [],
  ): string[] {
    const results: string[] = [];

    for (const key in object) {
      const value = object[key];
      const normalizedValue = ValueAnalyzer.normalizeValue(value);
      const currentValueType = ValueAnalyzer.getValueType(normalizedValue);
      const remainingKeys = ValueAnalyzer.createRemainingKeys(
        key,
        normalizedValue,
        previousValueType,
      );
      const fullKeyPath = [...namesArr, ...remainingKeys];
      const currentFormStructure = new FormBuilder(
        fullKeyPath,
        previousValueType,
        currentValueType,
      ).formStructure();

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
