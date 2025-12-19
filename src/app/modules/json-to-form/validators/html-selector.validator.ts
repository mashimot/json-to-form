import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const HTML_SELECTOR_REGEX =
  /^[a-zA-Z][/0-9a-zA-Z]*((:?-[0-9]+)*|(:?-[a-zA-Z][/0-9a-zA-Z]*(:?-[0-9]+)*)*)$/;

export const htmlSelectorValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    return HTML_SELECTOR_REGEX.test(value) ? null : { htmlSelector: { value } };
  };
};
