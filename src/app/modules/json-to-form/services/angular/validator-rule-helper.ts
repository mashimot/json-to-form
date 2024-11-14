import { typeMap } from "../../constants/type-map.constant";
import { ReservedWordEnum } from "../../enums/reserved-name.enum";
import { ValueType } from "./models/value.type";

export class ValidatorRuleHelper {
    static removeReservedWordFromString(completeKeyNameSplitDot: string[]): string[] {
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

    public static capitalizeFirstLetter(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static lowercaseFirstLetter(str: string): string {
        if (!str) return '';
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    public static toCamelCase(parts: string[], isFirstLetterLowerCase: boolean = false): string {
        const words = parts
            .map((part, index) => {
                if (index === 0) {
                    return part.toLowerCase(); // Primeira palavra em minúsculo
                }

                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(); // Demais palavras capitalizadas
            })
            .join('');

        return isFirstLetterLowerCase
            ? ValidatorRuleHelper.lowercaseFirstLetter(words)
            : ValidatorRuleHelper.capitalizeFirstLetter(words);
    }

    public static camelCasedString(string: string, isFirstLetterLowerCase: boolean = false): string {
        if (!string) {
            return '';
        }

        const stringToLowerCase = ((string || '')?.toLowerCase());
        const onlyLettersAndNumbers = stringToLowerCase.match(/[A-Z0-9]+/ig);
        let camelCase = '';

        if (onlyLettersAndNumbers) {
            camelCase = onlyLettersAndNumbers.map((word: string, i: number) => {
                if (!i) return word;
                return word[0].toUpperCase() + word.slice(1); // return newly formed string
            })
                .join("");
        }


        return isFirstLetterLowerCase
            ? ValidatorRuleHelper.lowercaseFirstLetter(camelCase)
            : ValidatorRuleHelper.capitalizeFirstLetter(camelCase);
    }

    //input: ['users', '*', 'address', 'number']
    //1. users.*.address.number
    //2. ['users.', '*', '.address.number']
    //3. ['users', '*', 'address.number']
    //4. 'users|*|address.number'
    //5. ['users', '*', 'address.number']
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

    public static getPath(dotNotation: string[]): string[] {
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

    public static getterFunctionName(keyNamesWithoutReservedWord: string): string {
        return ValidatorRuleHelper.camelCasedString(
            keyNamesWithoutReservedWord,
            true
        );
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
        const objToString = Object.prototype.toString.call(obj);
        const objType = typeof obj;

        return objType === "object" || objType === "function"
            ? typeMap[objToString] || objType as ValueType
            : objType as ValueType;
    }

    public static changeValue(value: any): any {
        if (['array', 'object', 'string'].includes(this.getType(value))) {
            return value;
        }

        return "";
    }

    public static createRemainingKeys(namesList: string[], previousType: string, currentKey: string, isArray: boolean): any[] {
        const remainingKeys = [];

        // Adiciona a chave se a lista de nomes estiver vazia ou se o tipo anterior não for 'array'
        if (!namesList.length || previousType !== 'array') {
            remainingKeys.push(currentKey);
        }

        // Adiciona 'true' se o valor atual for um array
        if (isArray) {
            remainingKeys.push(ReservedWordEnum.__ARRAY__);
        }

        return remainingKeys;
    }

    public static generateMethodName(path: string[]): string {
        // const cleanedPath = path.map(key => ValidatorRuleHelper.cleanKey(key.toString()));
        return ValidatorRuleHelper.camelCasedString(path.join(""));
    }

    public static getUniqueMethodName(
        path: string[],
        cleanKey: string,
        methodsSet: Set<string>
    ): string {
        let methodName = ValidatorRuleHelper.generateMethodName([...path, cleanKey]);
        let count = 1;

        // Incrementa o nome do método até que seja único
        while (methodsSet.has(methodName)) {
            const updatedPath = [...path.slice(0, path.length), cleanKey + count];
            methodName = ValidatorRuleHelper.generateMethodName(updatedPath);
            count++;
        }

        return methodName;
    }
}