import { FormBuilder, FormStructure } from '../function-definition';
import { ValueType } from '../models/value.type';
import { ValidatorRuleHelper } from '../validator-rule-helper';

interface FormContext {
  key: string;
  value: any;
  currentValueType: ValueType;
  fullKeyPath: string[];
  currentFormStructure: FormStructure;
}

export class ValidatorFormContextHelper {
  static buildContext(params: {
    object: { [key: string]: any };
    key: string;
    namesArr: string[];
    previousValueType: ValueType;
  }): FormContext {
    const { object, key, namesArr, previousValueType } = params;

    const rawValue = ValidatorRuleHelper.normalizeValue(object[key]);
    const currentValueType = ValidatorRuleHelper.getValueType(rawValue);
    const remainingKeys = ValidatorRuleHelper.createRemainingKeys(
      namesArr,
      previousValueType,
      key,
      currentValueType,
    );
    const fullKeyPath = [...namesArr, ...remainingKeys];
    const value =
      currentValueType === 'array' ? [rawValue[rawValue.length - 1]] : rawValue;
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
    };
  }
}
