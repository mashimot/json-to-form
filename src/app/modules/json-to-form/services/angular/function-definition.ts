import { Definition } from './models/Definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

export class FunctionDefinition {
	private CREATE: string = 'create';
	private DELETE: string = 'delete';
	private FORM_BUILDER: string = 'formBuilder';

	formBuilderGroup: string[] = [];
	parameters: string[] = [];
	completeKeyName: string[] = [];
	keyNameDotNotation: string[] = [];

	constructor(
		parameters: string[],
		completeKeyName: string[],
		formBuilderGroup: string[] = []
	) {
		this.parameters = [...(parameters || [])];
		this.completeKeyName = completeKeyName;
		this.keyNameDotNotation = ValidatorRuleHelper.dotNotation(completeKeyName);
		this.formBuilderGroup = formBuilderGroup;
	}

	public get(): Definition {
		const functionName = ValidatorRuleHelper.camelCasedString(this.keyNameDotNotation.join(""));
		const definition: Definition = {
			get: [],
			formBuilder: []
		};
		let counterAsterisk = 0;
		for (let i = this.keyNameDotNotation.length - 1; i >= 0; i--) {
			if (this.keyNameDotNotation[i] !== '*') {
				break;
			}
			counterAsterisk++;
		}
		const parameters = this.parameters.map(parameter => {
			return ValidatorRuleHelper.defineIndexName(this.completeKeyName, parameter.split('.')).join("");
		});
		// .map((parameter, index) => {
		// 	return 'index' + index;
		// });
		const returnFunction = this.generateReturnFunction(parameters);
		const lastIndex = parameters.length > 0 
			? parameters[parameters.length - 1] 
			: '';

		parameters.splice(-1, 1);
		returnFunction.splice(-1, 2);
		

		for (let i = counterAsterisk - 1; i >= 0; i--) {
			const dataMap: Map<string, string> = new Map();
			const getFunctionName = `get${functionName}${i > 0 ? i : ''}`;
			const parametersWithLastIndex = [
				...parameters,
				lastIndex
			];

			dataMap.set(
				'parameters',
				`(${parameters.map((p: string) => `${p}`).join(",")})`
			);
			dataMap.set(
				'parameters_typed',
				`(${parameters.map((p: string) => `${p}:number`).join(",")})`
			);
			dataMap.set(
				'parameters_with_last_index',
				`(${parametersWithLastIndex.map((p: string) => `${p}`).join(",")})`
			);
			dataMap.set(
				'parameters_with_last_index_typed',
				`(${parametersWithLastIndex.map((p: string) => `${p}:number`).join(",")})`
			);
			dataMap.set(
				'function_name', `${functionName}${i > 0 ? i : ''}`);
			dataMap.set(
				'get_function_name',
				getFunctionName
			);
			dataMap.set(
				'get_with_parameters',
				`${getFunctionName}(${parameters.map((p: string) => `${p}`).join(",")})`
			);
			dataMap.set(
				'get_at',
				`${dataMap.get('get_with_parameters')}.at(${lastIndex})`
			);
			dataMap.set(
				'index',
				parameters[i]
			);
			dataMap.set(
				'second_to_last_index',
				parameters[parameters.length - 1]
			);
			dataMap.set(
				'last_index',
				lastIndex
			);
			dataMap.set(
				'get_function',
				[
					`${getFunctionName}${dataMap.get('parameters_typed')}: FormArray {`,
					`return ${parameters.map(() => '(').join("")}${returnFunction.join("")} as FormArray;`,
					`}`
				]
					.join("\n")
			);
			dataMap.set(
				'delete_function',
				[
					`${this.DELETE}${dataMap.get('function_name')}${dataMap.get('parameters_with_last_index_typed')}:void {`,
					`this.${dataMap.get('get_with_parameters')}.removeAt(${lastIndex})`,
					`}`
				].join("\n")
			);
			dataMap.set(
				'delete',
				[
					`${this.DELETE}${dataMap.get('function_name')}${dataMap.get('parameters_with_last_index')}`
				].join("\n")
			);
			dataMap.set(
				'create_function',
				[
					`${this.CREATE}${dataMap.get('function_name')}(){`,
					`return ${
						i == counterAsterisk - 1
							? this.formBuilderGroup.join("")
							: [
								`this.${this.FORM_BUILDER}.array([`,
								`this.${this.CREATE}${functionName}${i + 1}()`,
								`])`
							].join("\n")
					}`,
					`}`
				]
					.join("\n")
			);
			dataMap.set(
				'create',
				[
					`${dataMap.get('get_with_parameters')}.push(${this.CREATE}${dataMap.get('function_name')}())`
				].join("\n")
			);

			definition.get.unshift(dataMap);
		}

		definition.formBuilder = [
			`this.${this.FORM_BUILDER}.array([`,
			`this.${this.CREATE}${definition.get[0].get('function_name')}()`,
			`]),`
		];

		return definition;
	}

	private generateReturnFunction(parameters: string[]): string[] {
		let returnFunction = this.keyNameDotNotation;
		let count = 0;

		for (let i = 0; i < this.keyNameDotNotation.length; i++) {
			const item = this.keyNameDotNotation[i];
			if (item === '*') {
				const currentParameter = parameters[count];
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
}
