import { FormBuilder, FormStructure } from '../function-definition';
import { VALUE_TYPES, ValueType } from '../models/value.type';
import { ValidatorRuleHelper } from '../validator-rule-helper';

export interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType;
  fullKeyPath: string[];
  currentFormStructure: FormStructure;
  interfaceName: string;
  originalCurrentValueType: ValueType;
  previousValueType: ValueType;
  formStructureStack: FormStructure[];
  nameDotNotation: string;
}

export abstract class ValidatorProcessorBase {
  public formContext: { [key: string]: { getters: string; creaters?: string } } = {};
  public names: string[] = [];
  public malmsteen: { [key: string]: any } = {};

  public process(
    object: { [key: string]: any },
    namesArr: string[] = [],
    previousValueType: any = VALUE_TYPES.OBJECT,
    formStructureStack: FormStructure[] = [],
  ): string[] {
    const results = Object.keys(object).map((key) => {
      const originalCurrentValueType = ValidatorRuleHelper.getValueType(object[key]);
      const normalizedValue = ValidatorRuleHelper.normalizeValue(object[key]);
      const currentValueType = ValidatorRuleHelper.getValueType(normalizedValue);
      const interfaceName = this.buildInterfaceName(key);
      const value =
        currentValueType === VALUE_TYPES.ARRAY
          ? [normalizedValue[normalizedValue.length - 1]]
          : normalizedValue;

      const remainingKeys = ValidatorRuleHelper.createRemainingKeys(
        value,
        previousValueType,
        key,
        currentValueType,
      );
      const fullKeyPath = [...namesArr, ...remainingKeys];
      const currentFormStructure = new FormBuilder(
        fullKeyPath,
        previousValueType,
        currentValueType,
        [],
      ).formStructure();

      const nameDotNotation = fullKeyPath
        .map((segment) => (segment === null ? 'At' : segment))
        .join('.');

      this.names.push(nameDotNotation);

      const fullContext = {
        key,
        value,
        currentValueType,
        fullKeyPath,
        currentFormStructure,
        interfaceName,
        previousValueType,
        originalCurrentValueType,
        formStructureStack,
        nameDotNotation,
      };

      return this.handleContext(fullContext);
    });

    return results.filter((el) => el);
  }

  public handleContext(context: FormContext): string {
    const { value, currentValueType, fullKeyPath, key } = context;
    return '';
  }

  private buildInterfaceName(key: string): string {
    return `I${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  }
}
