import { FormBuilder, FormStructure } from '../function-definition';
import { VALUE_TYPES, ValueType } from '../models/value.type';
import { ValidatorRuleHelper } from '../validator-rule-helper';

export interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType;
  fullKeyPath: string[];
  currentFormStructure: FormStructure;
  nestedInterfaceName: string;
  originalCurrentValueType: ValueType;
  previousValueType: ValueType;
  formStructureStack: FormStructure[];
}

export abstract class ValidatorProcessorBase {
  public process(
    object: { [key: string]: any },
    namesArr: string[] = [],
    previousValueType: any = VALUE_TYPES.OBJECT,
    formStructureStack: FormStructure[] = [],
  ): string[] {
    const results = Object.keys(object).map((key) => {
      const originalCurrentValueType = ValidatorRuleHelper.getValueType(object[key]);
      const rawValue = ValidatorRuleHelper.normalizeValue(object[key]);
      const currentValueType = ValidatorRuleHelper.getValueType(rawValue);
      const remainingKeys = ValidatorRuleHelper.createRemainingKeys(
        namesArr,
        previousValueType,
        key,
        currentValueType,
      );
      const fullKeyPath = [...namesArr, ...remainingKeys];
      const nestedInterfaceName = 'I' + key.charAt(0).toUpperCase() + key.slice(1);
      const value =
        currentValueType === VALUE_TYPES.ARRAY ? [rawValue[rawValue.length - 1]] : rawValue;
      const currentFormStructure = new FormBuilder(
        fullKeyPath,
        previousValueType,
        currentValueType,
        [],
      ).formStructure();

      const fullContext = {
        key,
        value,
        currentValueType,
        fullKeyPath,
        currentFormStructure,
        nestedInterfaceName,
        previousValueType,
        originalCurrentValueType,
        formStructureStack,
      };

      return this.handleContext(fullContext);
    });

    return results.filter((el) => el);
  }

  public handleContext(context: FormContext): string {
    const { value, currentValueType, fullKeyPath, key } = context;
    return '';
  }
}
