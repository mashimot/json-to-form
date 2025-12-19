export class ValidatorRuleHelper {
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
      ? this.lowercaseFirstLetter(camelCase)
      : this.capitalizeFirstLetter(camelCase);
  }
}
