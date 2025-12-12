import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const KEY_REGEX = /^[a-zA-Z0-9_-]*(\.\*)*$/;

function collectKeyErrors(obj: any, path = '', errors: string[] = []): string[] {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      collectKeyErrors(item, `${path}[${index}]`, errors);
    });
    return errors;
  }

  if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (!KEY_REGEX.test(key)) {
        errors.push(`Invalid key at: \`${currentPath}\``);
      }

      collectKeyErrors(obj[key], currentPath, errors);
    });
  }

  return errors;
}

export function validateJsonObject(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return { invalidJson: true, messages: ['JSON is empty'] };
    }

    let parsed: any;

    if (typeof control.value === 'string') {
      try {
        parsed = JSON.parse(control.value);
      } catch {
        return { invalidJson: true, messages: ['Invalid JSON format'] };
      }
    } else {
      parsed = control.value;
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        invalidJson: true,
        messages: ['JSON must be an object starting with `{}`'],
      };
    }

    if (Object.keys(parsed).length === 0) {
      return {
        invalidJson: true,
        messages: ['JSON must not be empty'],
      };
    }

    const errors = collectKeyErrors(parsed);

    if (errors.length > 0) {
      return {
        invalidJson: true,
        messages: errors,
      };
    }

    return null;
  };
}
