import { typeMap } from '../../constants/type-map.constant';
import { __ARRAY__ } from '../../enums/reserved-name.enum';
import { VALUE_TYPES, ValueType } from './models/value.type';

export class ValidatorRuleHelper {
  static str_getcsv(text: string) {
    let p = '',
      row = [''],
      ret = [row],
      i = 0,
      r = 0,
      s = !0,
      l;
    for (l of text) {
      if ('"' === l) {
        if (s && l === p) row[i] += l;
        s = !s;
      } else if (',' === l && s) l = row[++i] = '';
      else if ('\n' === l && s) {
        if ('\r' === p) row[i] = row[i].slice(0, -1);
        row = ret[++r] = [(l = '')];
        i = 0;
      } else row[i] += l;
      p = l;
    }
    return ret;
  }

  // public static htmlSelectorRe = /^[a-zA-Z][.0-9a-zA-Z]*((:?-[0-9]+)*|(:?-[a-zA-Z][.0-9a-zA-Z]*(:?-[0-9]+)*)*)$/;
  public static htmlSelectorRe =
    /^[a-zA-Z][/0-9a-zA-Z]*((:?-[0-9]+)*|(:?-[a-zA-Z][/0-9a-zA-Z]*(:?-[0-9]+)*)*)$/;
  public static validateHtmlSelector(selector: string): string | boolean {
    if (selector && !this.htmlSelectorRe.test(selector)) {
      return `Selector (${selector}) is invalid.`;
    }

    return true;
  }

  public static validateObject(obj: any, names: string = '', errors: string[] = []): string[] {
    return Object.keys(obj).map((k: any) => {
      const v = obj[k];
      const rest = names.length > 0 ? '.' + k : k;
      const re = /^[a-zA-Z0-9_-]*(\.\*)*$/;

      if (!re.test(k)) {
        errors.push(`Errors at:  "${names + rest}"`);
      }

      if (Object.prototype.toString.call(v) === '[object Array]') {
        this.validateObject(v, names + rest, errors);
      }

      if (Object.prototype.toString.call(v) === '[object Object]') {
        this.validateObject(v, names + rest, errors);
      }

      return errors;
    })[0];
  }

  public static parseStringRule(rule: string | any[]): any[] {
    if (typeof rule === 'string') {
      const afterColon = rule.substr(rule.indexOf(':') + 1);

      if (rule.indexOf(':') != -1) {
        return [
          rule.split(':')[0],
          [afterColon],
          //ValidatorRuleHelper.str_getcsv(afterColon)
        ];
      }
    }

    if (Array.isArray(rule)) {
      if (!rule) {
        return ['in', []];
      }

      return ['in', rule];
    }

    return [rule, []];
  }

  public static capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public static lowercaseFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  public static camelCasedString(string: string, isFirstLetterLowerCase: boolean = false): string {
    if (!string) {
      return '';
    }

    const stringToLowerCase = (string || '')?.toLowerCase();
    const onlyLettersAndNumbers = stringToLowerCase.match(/[A-Z0-9]+/gi);
    let camelCase = '';

    if (onlyLettersAndNumbers) {
      camelCase = onlyLettersAndNumbers
        .map((word: string, i: number) => {
          if (!i) return word;
          return word[0].toUpperCase() + word.slice(1); // return newly formed string
        })
        .join('');
    }

    return isFirstLetterLowerCase
      ? ValidatorRuleHelper.lowercaseFirstLetter(camelCase)
      : ValidatorRuleHelper.capitalizeFirstLetter(camelCase);
  }

  public static getValueType(value: unknown): ValueType {
    const rawType = Object.prototype.toString.call(value);
    const typeofValue = typeof value;

    if (typeofValue === VALUE_TYPES.OBJECT || typeofValue === VALUE_TYPES.FUNCTION) {
      return typeMap[rawType] ?? (typeofValue as ValueType);
    }

    return typeofValue as ValueType;
  }

  public static normalizeValue(value: any): any {
    if (['array'].includes(this.getValueType(value))) {
      return this.convertArray(value);
    }

    if (['object', 'string'].includes(this.getValueType(value))) {
      return value;
    }

    return '';
  }

  public static convertArray(value: any[]): any[] {
    if (value.length === 0) return value;

    const [first] = value;

    const allObjects = value.every((item) => this.getValueType(item) === VALUE_TYPES.OBJECT);

    if (allObjects) {
      return [Object.assign({}, ...value)];
    }

    return [first];
  }

  public static createRemainingKeys(
    path: string[],
    previousValueType: ValueType,
    currentKey: string,
    currentValueType: ValueType,
  ): any[] {
    const modifiers: (string | typeof __ARRAY__)[] = [];

    const isRootOrNonArrayValueTypeParent =
      path.length === 0 || previousValueType !== VALUE_TYPES.ARRAY;
    const isArrayValue = currentValueType === VALUE_TYPES.ARRAY;

    if (isRootOrNonArrayValueTypeParent) {
      modifiers.push(currentKey);
    }

    if (isArrayValue) {
      modifiers.push(__ARRAY__);
    }

    return modifiers;
  }
}
