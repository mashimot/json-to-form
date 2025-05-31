// import { FormArrayBuilder } from './function-definition';

// describe('FormArrayBuilder', () => {
//     it('1111111111111111111111111111111111', () => {
//         const result = new FormArrayBuilder(
//             ['test', 'key', 'name'],
//             []
//         )

//         const firstMap = result.createFormGroupDataMap();
//         expect(firstMap).toBeDefined();
//         expect(firstMap.get('has_reserved_word')).toBe('N');
//         expect(firstMap.get('attribute_name')).toBe('testKeyName');
//         expect(firstMap.get('parameters')).toBe('()');
//         expect(firstMap.get('path')).toBe("'test','key','name'");
//         expect(firstMap.get('parameters_typed')).toBe(`()`);
//         expect(firstMap.get('parameters_with_last_index')).toBe(`()`);
//         expect(firstMap.get('parameters_with_last_index_typed')).toBe(`()`);
//         expect(firstMap.get('function_name')).toBe(`testKeyName`);
//         expect(firstMap.get('get_function_name')).toBe('get testKeyName');
//         expect(firstMap.get('get_with_parameters')).toBe(`get testKeyName()`);
//         expect(firstMap.get('create_function_name')).toBe('createTestKeyName');
//         expect(firstMap.get('delete_function_name')).toBe(`deleteTestKeyName`);
//     });

//     // it('2222222222222222222222', () => {
//     //     const bunda = [ReservedWordEnum.__ARRAY__, ReservedWordEnum.__ARRAY__, ReservedWordEnum.__ARRAY__];
//     //     const result = new FormArrayBuilder(
//     //         ['test', 'key', 'name', ReservedWordEnum.__ARRAY__, ReservedWordEnum.__ARRAY__, ReservedWordEnum.__ARRAY__]
//     //         ,
//     //         []
//     //     )

//     //     result.formArray = bunda;

//     //     spyOn(result, 'getTotalAsterisks').and.returnValue(3);

//     //     const dataMaps = result.createFormArrayDataMap();
//     //     expect(dataMaps).toBeDefined();
//     //     expect(dataMaps.length).toBe(3);

//     //     const firstMap = dataMaps[2];
//     //     expect(firstMap.get('attribute_name')).toBe('testKeyName3');
//     //     expect(firstMap.get('parameters')).toBe('(index1,index2,index3)');
//     //     expect(firstMap.get('path')).toBe("'test','key','name',index1,index2,index3");
//     //     // expect(firstMap.get('parameters_typed')).toBe(`()`);
//     //     // expect(firstMap.get('parameters_with_last_index')).toBe(`()`);
//     //     // expect(firstMap.get('parameters_with_last_index_typed')).toBe(`()`);
//     //     // expect(firstMap.get('function_name')).toBe(`TestKeyName`);
//     //     // expect(firstMap.get('get_function_name')).toBe('getTestKeyName');
//     //     // // expect(firstMap.get('create_function_name')).toBe( endsWithHue ? `${this.CREATE}${dataMap.get('function_name')}` : '');
//     //     // // expect(firstMap.get('delete_function_name')).toBe(endsWithHue ? `${this.DELETE}${dataMap.get('function_name')}` : '');
//     //     // expect(firstMap.get('get_with_parameters')).toBe(`getTestKeyName()`);
//     // });

//     //   it('should create form array data map with counterAsterisk <= 0', () => {
//     //     spyOn(service, 'getTotalAsterisks').and.returnValue(0);

//     //     const result = service['createFormArrayDataMap']();

//     //     expect(result).toBeDefined();
//     //     expect(result.length).toBe(1);

//     //     const map = result[0];
//     //     expect(map.get('has_reserved_word')).toBe('S');
//     //     expect(map.get('form_type')).toBe('FormGroup');
//     //     expect(map.get('parameters')).toBe('(param1,param2)');
//     //     expect(map.get('get_function_name')).toBe('getTestFunctionFormGroup');
//     //   });
// });
