import { ValidatorRuleHelper } from './validator-rule-helper';
export class ValidatorDefinition {
  private static CREATE: string = 'create';
  private static DELETE: string = 'delete';
  private static FORM_BUILDER: string = 'formBuilder';

  public constructor(){
  }

  public static get(element: any): any {
      let definition: any = {
          get: [],
          lastDefinition: {},
          formBuilderArray: {
              open: [],
              close: []
          }
      };
      let parameters = [...element.parameters] ?? [];
      let completeKeyName = [...element.completeKeyName]
      let keyNameDotNotation = [...ValidatorRuleHelper.dotNotation(completeKeyName)];
      //let isValueAnArray = element.isValueAnArray ? element.isValueAnArray : false;
      let formBuilderGroup = typeof element.formBuilderGroup != 'undefined'
          ? element.formBuilderGroup.join("")
          : '';

      if (parameters.length <= 0) {
          return definition;
      }
     
      let returnFunction = [...keyNameDotNotation];
      let count = 0;
      for (let i = 0; i < keyNameDotNotation.length; i++) {
          const item = keyNameDotNotation[i];
          if (item == '*') {
              const currentParameter = parameters[count];
              returnFunction[i] = ` as FormArray).at(${currentParameter})`
              count++;
          } else {
              returnFunction[i] = `.get('${item}')`;
              if (i == 0) {
                  returnFunction[i] = `this.form${returnFunction[i]}`;
              }
          }
      }
      
      let functionName = ValidatorRuleHelper.camelCasedString(keyNameDotNotation.join(""));
      let get = [];
      let counterAsterisk = 0;
      for (let i = keyNameDotNotation.length - 1; i >= 0; i--) {
          if (keyNameDotNotation[i] != '*') {
              break;
          }
          counterAsterisk++;
      }

      for (let i = counterAsterisk - 1; i >= 0; i--) {
          let data: any = {};
          const getFunctionName = `get${functionName}${i > 0 ? i : ''}`;
          const lastIndex = parameters[parameters.length - 1];

          parameters.splice(-1, 1);
          returnFunction.splice(-1, 1);

          definition.completeKeyName = completeKeyName.join(".");
          definition.formBuilderArray.open.push(`this.${this.FORM_BUILDER}.array([`);
          definition.formBuilderArray.close.push(`])`);

          const parametersWithLastIndex = [...parameters];
          parametersWithLastIndex.push(lastIndex);
          data.parameters = `(${parameters.map((p: any) => `${p}`).join(",")})`;
          data.parameters_typed = `(${parameters.map((p: any) => `${p}:number`).join(",")})`;
          data.parameters_with_last_index = `(${parametersWithLastIndex.map((p: any) => `${p}`).join(",")})`;
          data.parameters_with_last_index_typed = `(${parametersWithLastIndex.map((p: any) => `${p}:number`).join(",")})`;
          data.function_name = `${functionName}${i > 0 ? i : ''}`;
          data.get_function_name = getFunctionName;
          data.get_with_parameters = `${getFunctionName}(${parameters.map((p: any) => `${p}`).join(",")})`;
          data.get_at = `${data.get_with_parameters}.at(${lastIndex})`;
          data.index = parameters[i];
          data.second_to_last_index = parameters[parameters.length - 1];
          data.last_index = lastIndex;
          data.get_function = [
              `${getFunctionName}${data.parameters_typed}: FormArray {`,
                  `return ${parameters.map(() => '(').join("")}${returnFunction.join("")} as FormArray;`,
              `}`
          ].join("\n");
          data.delete_function = [
              `${this.DELETE}${data.function_name}${data.parameters_with_last_index_typed}:void {`,
                  `this.${data.get_with_parameters}.removeAt(${lastIndex})`,
              `}`
          ].join("\n");
          data.delete = [
              `${this.DELETE}${data.function_name}${data.parameters_with_last_index}`
          ].join("\n");
  
          data.create_function = [
              `${this.CREATE}${data.function_name}(){`,
                  `return ${
                      i == counterAsterisk - 1
                          ? formBuilderGroup
                          : [
                              definition.formBuilderArray.open.splice(-1, 1).join("\n"),
                              `this.${this.CREATE}${functionName}${i + 1}()`,
                              definition.formBuilderArray.close.splice(-1, 1).join(",\n")
                          ].join("\n")
                  }`,
              `}`
          ].join("\n");
          
          data.create = [
              `${data.get_with_parameters}.push(${this.CREATE}${data.function_name}())`
          ].join("\n");
          get.unshift(data);
      }

      definition.formBuilder = [
          `this.${this.FORM_BUILDER}.array([`,
          `this.${this.CREATE}${get[0].function_name}()`,
          `]),`
      ];
      
      if (get.length > 0) {
          definition.get = get;
          definition.lastDefinition = get[get.length - 1];
      }

      return definition;
  }
}