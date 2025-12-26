import { __ARRAY__ } from '../../enums/reserved-name.enum';
import { FormBuilder } from './function-definition';
import { VALUE_TYPES } from './models/value.type';

describe('FormBuilder', () => {
  it('should create an instance', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'user',
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'name',
        pathType: VALUE_TYPES.STRING,
      },
    ]);
    expect(builder).toBeTruthy();
  });

  it('should generate formStructure for basic path without array', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'user',
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'name',
        pathType: VALUE_TYPES.STRING,
      },
    ]);

    const result = builder.formStructure();

    expect(result.methodName).toBe('userName');
    expect(result.attributeName).toContain('userName');
    expect(result.paramCounter).toBe(0);
    expect(result.getter.name).toBe('get userName');
    expect(result.creator.name).toBe('createUserName');
    expect(result.reactiveFormType).toBe('FormControl');
    expect(result.path).toEqual([`'user'`, `'name'`]);
  });

  it('should generate formStructure with reserved __ARRAY__ handling', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'users',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.STRING,
      },
      {
        pathKey: 'name',
        pathType: VALUE_TYPES.STRING,
      },
    ]);

    const result = builder.formStructure();

    expect(result.methodName).toBe('usersAtName');
    expect(result.getter.name).toBe('getUsersAtName');
    expect(result.creator.name).toBe('createUsersAtName');
    expect(result.params).toEqual(['index0']);
    expect(result.paramCounter).toBe(1);
    expect(result.path).toEqual([`'users'`, `index0`, `'name'`]);
    expect(result.reactiveFormType).toBe('FormControl');
    expect(result.getter.withReturn).toContain('this.f.get');
  });

  it('should generate method with multiple array levels correctly', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'companies',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'departments',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.STRING,
      },
      {
        pathKey: 'name',
        pathType: VALUE_TYPES.STRING,
      },
    ]);

    const result = builder.formStructure();

    expect(result.methodName).toBe('companiesAtDepartmentsAtName');
    expect(result.paramCounter).toBe(2);
    expect(result.params).toEqual(['index0', 'index1']);
    expect(result.path).toEqual([`'companies'`, 'index0', `'departments'`, 'index1', `'name'`]);
    expect(result.reactiveFormType).toBe('FormControl');
  });

  it('should generate getter function with parameters typed 0', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'peoples',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'phones',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'number',
        pathType: VALUE_TYPES.STRING,
      },
    ]);

    const result = builder.formStructure();
    expect(result.getter.withReturn).toContain('index0:number, index1:number');
    expect(result.getter.withReturn).toContain('this.f.get');
    expect(result.getter.withReturn).toContain('FormControl');
  });

  it('should generate getter function with parameters typed 1', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'peoples',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'phones',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.STRING,
      },
    ]);

    const result = builder.formStructure();

    expect(result.methodName).toBe('peoplesAtPhonesAtAt');
    expect(result.paramCounter).toBe(3);
    expect(result.getter.withReturn).toContain('index0:number, index1:number');
    expect(result.getter.withReturn).toContain('this.f.get');
    expect(result.getter.withReturn).toContain('FormControl');
  });

  it('should generate getter function with parameters typed 1', () => {
    const builder = new FormBuilder([
      {
        pathKey: 'people',
        pathType: VALUE_TYPES.ARRAY,
      },
      {
        pathKey: __ARRAY__,
        pathType: VALUE_TYPES.OBJECT,
      },
      {
        pathKey: 'phones',
        pathType: VALUE_TYPES.OBJECT,
      },
    ]);

    const result = builder.formStructure();

    expect(result.methodName).toBe('peopleAtPhones');
    expect(result.paramCounter).toBe(1);
    expect(result.getter.withReturn).toContain('index0:number');
    expect(result.getter.withReturn).toContain('this.f.get');
    expect(result.getter.withReturn).toContain('FormGroup');
  });
});
