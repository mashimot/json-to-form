import { ValueType } from "../services/angular/models/value.type";

export const typeMap: Record<string, ValueType> = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regExp",
    "[object Object]": "object",
    "[object Error]": "error"
};
