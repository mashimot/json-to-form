export class ValidatorRuleHelper {
  public static parseStringRule(rule: string | any[]): any[] {
    if (typeof rule === 'string') {
      const afterColon = rule.substr(rule.indexOf(':') + 1);

      if (rule.indexOf(':') != -1) {
        return [rule.split(':')[0], [afterColon]];
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
}
