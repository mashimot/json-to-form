import { ReservedWordEnum } from "../../enums/reserved-name.enum";
import { ValueType } from "./models/value.type.";

export class ValidatorRuleHelper {
    static removeAsteriskFromString(completeKeyNameSplitDot: string[]): string[] {
        return (completeKeyNameSplitDot || []).reduce((acc: any, item: any) => {
            if (item !== ReservedWordEnum.__ARRAY__) {
                acc.push(item);
            }

            return acc;
        }, []);
    }

    static str_getcsv(text: string) {
        let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
        for (l of text) {
            if ('"' === l) {
                if (s && l === p) row[i] += l;
                s = !s;
            } else if (',' === l && s) l = row[++i] = '';
            else if ('\n' === l && s) {
                if ('\r' === p) row[i] = row[i].slice(0, -1);
                row = ret[++r] = [l = '']; i = 0;
            } else row[i] += l;
            p = l;
        }
        return ret;
    }

    public static defineIndexName(completeKeyName: string[], keyNameSplit: string[]): string[] {
        let indexName: string[] = []
        let index = 0;
        for (let i = completeKeyName.length - 1; i >= 0; i--) {
            if (completeKeyName[i] !== ReservedWordEnum.__ARRAY__) {
                break;
            }

            let rand = ValidatorRuleHelper.camelCasedString(keyNameSplit.join(""));
            rand = `index${rand}${index == 0 ? '' : index}`;
            indexName.push(rand);
            index++;
        }

        return indexName;
    }

    public static removeParameters(n: string[], parameters: string[]): string[] {

        for (let i = n.length - 1; i >= 0; i--) {
            let item = n[i];
            if (item !== ReservedWordEnum.__ARRAY__) {
                break;
            }
            parameters.splice(-1, 1);
        }

        return parameters;
    }

    // public static htmlSelectorRe = /^[a-zA-Z][.0-9a-zA-Z]*((:?-[0-9]+)*|(:?-[a-zA-Z][.0-9a-zA-Z]*(:?-[0-9]+)*)*)$/;
    public static htmlSelectorRe = /^[a-zA-Z][/0-9a-zA-Z]*((:?-[0-9]+)*|(:?-[a-zA-Z][/0-9a-zA-Z]*(:?-[0-9]+)*)*)$/;
    public static validateHtmlSelector(selector: string): string | boolean {
        if (selector && !this.htmlSelectorRe.test(selector)) {
            return `Selector (${selector}) is invalid.`;
        }

        return true;
    }

    public static bracketsNotation(string: string[]): string[] {
        let id: any = []
        string.forEach((v, index) => {
            //let v = item.split(".");
            if (v.trim() == ReservedWordEnum.__ARRAY__) {
                v = '';;
            }
            id[index] = `[${v}]`;
            if (index == 0) {
                id[0] = v
            }
        });

        return id;
    }

    public static validateObject(obj: any, names: string = '', errors: string[] = []): string[] {
        return Object.keys(obj)
            .map((k: any) => {
                let v = obj[k];
                let rest = names.length > 0
                    ? '.' + k
                    : k;
                const re = /^[a-zA-Z0-9_-]*(\.\*)*$/;

                if (!re.test(k)) {
                    errors.push(`Errors at:  "${names + rest}"`);
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
                    [afterColon]
                    //ValidatorRuleHelper.str_getcsv(afterColon)
                ];
            }
        }

        if (Array.isArray(rule)) {
            if (!rule) {
                return [
                    'in',
                    []
                ];
            }

            return [
                'in',
                rule
            ];
        }

        return [
            rule,
            []
        ];
    }

    public static camelCasedString(string: string, isFirstLetterLowerCase: boolean = false): string {
        if (!string) {
            return '';
        }

        const stringToLowerCase = ((string || '')?.toLowerCase());
        const onlyLettersAndNumber = stringToLowerCase.match(/[A-Z0-9]+/ig);
        let camelCase = '';

        if (onlyLettersAndNumber) {
            camelCase = onlyLettersAndNumber.map((word: string, i: number) => {
                if (!i) return word;
                return word[0].toUpperCase() + word.slice(1); // return newly formed string
            })
                .join("");
        }

        const firstLetter = isFirstLetterLowerCase
            ? camelCase[0].toLowerCase()
            : camelCase[0].toUpperCase();

        return `${firstLetter}${camelCase.slice(1)}`;
    }

    //['users', '*', 'address', 'number']
    //users.*.address.number
    //['users.', '*', '.address.number']
    //['users', '*', 'address.number']
    //'users|*|address.number'
    //['users', '*', 'address.number']
    public static dotNotation(string: string[]): string[] {
        if (string.length <= 0) {
            return [];
        }

        return string.join(".")
            .split(ReservedWordEnum.__ARRAY__)
            .map(str => str.replace(/(^\.+|\.+$)/mg, ''))
            .join("|" + ReservedWordEnum.__ARRAY__ + "|")
            .split("|")
            .filter(el => el);
    }

    public static splitRules(obj: any): any {

        let rules = Object.keys(obj).map((k) => {
            let v = obj[k];
            if (Object.prototype.toString.call(v) === '[object Object]') {
                return {
                    [k]: this.splitRules(v)
                }
            }

            //split and then converts into array of rules
            if (typeof v === 'string') {
                return {
                    [k]: v.split("|")
                };
            }

            if (Array.isArray(v)) {
                return {
                    [k]: v
                }
            }

            return null;

        });

        let asObject = Object.assign({}, ...rules);
        return asObject;
    }

    //return parameter name
    //Ex. ['index1', 'index2']
    public static getParameters(dotNotation: string[]): string[] {
        let count = 0;
        return dotNotation.reduce((parameters: string[], item) => {
            if (item === ReservedWordEnum.__ARRAY__) {
                parameters.push(this.getIndexName(count));
                count++;
            }

            return parameters;
        }, []);
    }

    public static getIndexName(count: number): string {
        return `index${(count || 0) + 1}`;
    }

    public static uniqueId(dotNotation: string[]): string[] {
        const id = [...dotNotation];
        let count = 0;
        for (let i = 0; i < id.length; i++) {
            const item = id[i];
            if (item === ReservedWordEnum.__ARRAY__) {
                // const currentParameter = parameters[count];
                const currentParameter = this.getIndexName(count);
                id[i] = `{{ ${currentParameter} }}`
                count++;
            }
        }

        return id;
    }

    public static getField(dotNotation: string[]): string[] {
        const id = [...dotNotation];
        let count = 0;
        for (let i = 0; i < id.length; i++) {
            const item = id[i];
            if (item === ReservedWordEnum.__ARRAY__) {
                id[i] = this.getIndexName(count);
                count++;
            } else {
                id[i] = `'${item}'`;
            }
        }

        return id;
    }

    public static generateReturnFunction(dotNotation: string[]): string[] {
        const returnFunction = [...dotNotation];
        let count = 0;

        for (let i = 0; i < returnFunction.length; i++) {
            const item = returnFunction[i];
            if (item === ReservedWordEnum.__ARRAY__) {
                const currentParameter = this.getIndexName(count);
                returnFunction[i] = ` as FormArray).at(${currentParameter})`
                count++;
            } else {
                returnFunction[i] = `.get('${item}')`;
                if (i === 0) {
                    returnFunction[i] = `this.form${returnFunction[i]}`;
                }
            }
        }

        return returnFunction;
    }

    public static getType(obj: any): ValueType {
        const objToString = ({}).toString;
        const types = [
            "Boolean",
            "Number",
            "String",
            "Function",
            "Array",
            "Date",
            "RegExp",
            "Object",
            "Error"
        ];
        const typeMap = types.reduce((acc: any, item) => {
            acc[`[object ${item}]`] = item.toLowerCase();
            return acc;
        }, {});

        return typeof obj === "object" || typeof obj === "function"
            ? typeMap[objToString.call(obj)] || "object"
            : typeof obj;
    }

    public static changeValue(value: any): any {
        if (['array', 'object', 'string'].includes(this.getType(value))) {
            return value;
        }

        return "";
    }

}