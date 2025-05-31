import { FormBuilder } from "../function-definition";
import { ValueType } from "../models/value.type";
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
        const currentValueType = ValidatorRuleHelper.resolveValueType(value);
        const remainingKeys = ValidatorRuleHelper.createRemainingKeys(
            namesArr,
            previousValueType,
            key,
            currentValueType
        );
        const fullKeyPath = [...namesArr, ...remainingKeys];

        const isNotLastArrayItem =
            currentValueType !== 'array' &&
            previousValueType === 'array' &&
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