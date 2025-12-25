import { __ARRAY__ } from '../enums/reserved-name.enum';
import { ValueType } from '../services/angular/models/value.type';

export interface PathSegmentInterface {
  pathKey: string | typeof __ARRAY__;
  pathType: ValueType;
}
