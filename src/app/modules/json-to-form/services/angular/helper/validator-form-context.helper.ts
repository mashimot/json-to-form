import { FormBuilder } from "../function-definition";
import { VALUE_TYPES, ValueType } from "../models/value.type";
import { ValidatorRuleHelper } from "../validator-rule-helper";

interface FormContext {
    key: string;
    value: any;
    currentValueType: ValueType;
    fullKeyPath: string[];
    currentFormStructure: any;
    isNotLastArrayItem: boolean;
    isLastIndexFromValueArray: boolean;
}

export class ValidatorFormContextHelper {
    static buildContext(params: {
        object: { [key: string]: any };
        key: string;
        namesArr: string[];
        previousValueType: ValueType;
        index: number;
        currentIndex: number;
    // }): FormContext | null {
    }): any {
        const {
            object,
            key,
            namesArr,
            previousValueType,
            index,
            currentIndex,
        } = params;

        const value = ValidatorRuleHelper.normalizeValue(object[key]);
        const currentValueType = ValidatorRuleHelper.getValueType(value);
        const remainingKeys = ValidatorRuleHelper.createRemainingKeys(
            namesArr,
            previousValueType,
            key,
            currentValueType
        );
        const fullKeyPath = [...namesArr, ...remainingKeys];

        const isNotLastArrayItem =
            currentValueType !==  VALUE_TYPES.ARRAY &&
            previousValueType === VALUE_TYPES.ARRAY &&
            currentIndex - 1 !== index;

        if (isNotLastArrayItem) {
            return null;
        }

        const currentFormStructure = new FormBuilder(
            fullKeyPath,
            previousValueType,
            currentValueType,
            []
        ).formStructure();

        const isLastIndexFromValueArray = currentIndex - 1 === index;

        return {
            key,
            value,
            currentValueType,
            fullKeyPath,
            currentFormStructure,
            isNotLastArrayItem,
            isLastIndexFromValueArray,
        };
    }
}