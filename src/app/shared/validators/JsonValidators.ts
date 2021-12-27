import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { ValidatorRuleHelper } from "src/app/services/angular/validator-rule-helper";

export class JsonValidators {
    static validateObject(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const error: ValidationErrors = { 
                invalidJson: true
            };

            let object = control.value;
            if(typeof control.value == 'string'){
                object = JSON.parse(control.value);
            }

            if(typeof object == 'undefined'){
                error.messages = ['JSON undefined'];
                control.setErrors(error);
                return error;
            }

            let isArray = Array.isArray(object);

            if (Object.prototype.toString.call(object) != '[object Object]') {
                error.messages = ['JSON should start with curly brackets'];
                return error;
            }

            if(Object.keys(object).length <= 0){
                error.messages = ['JSON must be not empty'];
                control.setErrors(error);
                return error;
            }

            let errors: string[] = ValidatorRuleHelper.validateObject(object);
            if(errors.length > 0){
                error.messages = errors;
                control.setErrors(error);
                return error;
            }

            control.setErrors(null);
            return null;
        }
    }
}