import { FormBuilder, FormStructure } from '../function-definition';
import { VALUE_TYPES, ValueType } from '../models/value.type';
import { ValidatorRuleHelper } from '../validator-rule-helper';

interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType;
  fullKeyPath: string[];
  currentFormStructure: FormStructure;
  nestedInterfaceName: string;
  originalCurrentValueType: ValueType;
}

export class ValidatorFormContextHelper {
  private static buildContext(params: {
    object: { [key: string]: any };
    key: string;
    namesArr: string[];
    previousValueType: ValueType;
  }): FormContext {
    const { object, key, namesArr, previousValueType } = params;

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

    return {
      key,
      value,
      currentValueType,
      fullKeyPath,
      currentFormStructure,
      nestedInterfaceName,
      originalCurrentValueType,
    };
  }

  public static loop<T>(
    object: { [key: string]: any },
    namesArr: string[],
    previousValueType: ValueType,
    callback: (context: FormContext) => T,
  ) {
    return Object.keys(object).map((key) => {
      const context = this.buildContext({
        object,
        key,
        namesArr,
        previousValueType,
      });

      return callback(context);
    });
  }
}
