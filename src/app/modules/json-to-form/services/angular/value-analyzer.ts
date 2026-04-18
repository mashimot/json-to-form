import { typeMap } from '../../constants/type-map.constant';
import { __ARRAY__ } from '../../enums/reserved-name.enum';
import { PathSegmentInterface } from '../../interfaces/path-segment.interface';
import { VALUE_TYPES, ValueType } from './models/value.type';

export class ValueAnalyzer {
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
      return [this.deepMergeObject(value)];
    }

    return [first];
  }

  private static deepMergeObject(objects: any[]): any {
    return objects.reduce((merged, obj) => {
      return this.deepMerge(merged, obj);
    }, {});
  }

  private static deepMerge(target: any, source: any): any {
    const output = Object.assign({}, target);

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in output)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(output[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  private static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
