import { AbstractControl, ValidationErrors } from '@angular/forms';

export class ArrayValidators {
  static minLengthArray(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value.length >= min) return null;

      return { minLengthArray: { valid: false } };
    };
  }
}
