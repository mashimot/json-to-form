import { Definition } from './models/Definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

export class FunctionDefinition {
	private CREATE: string = 'create';
	private DELETE: string = 'delete';
	private FORM_BUILDER: string = 'formBuilder';
	private formBuilderGroup: string[] = [];
	// private completeKeyName: string[] = [];
	private dotNotationSplit: string[] = [];

	constructor(
		completeKeyName: string[],
		formBuilderGroup: string[] = []
	) {
		// this.completeKeyName = completeKeyName;
		this.dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyName);
		this.formBuilderGroup = formBuilderGroup;
	}

	public getTotalAsterisks(): number {
		let counterAsterisk = 0;
		for (let i = this.dotNotationSplit.length - 1; i >= 0; i--) {
			if (this.dotNotationSplit[i] !== '*') {
				break;
			}
			counterAsterisk++;
		}

		return counterAsterisk;
	}

	public get(): Definition {
		const functionName = ValidatorRuleHelper.camelCasedString(this.dotNotationSplit.join(""));
		const definition: Definition = {
			get: [],
			formBuilder: []
		};
		const counterAsterisk = this.getTotalAsterisks();
		const parameters = [...ValidatorRuleHelper.getParameters(this.dotNotationSplit)];
		const returnFunction = this.generateReturnFunction(parameters);

		for (let i = counterAsterisk - 1; i >= 0; i--) {
			const dataMap: Map<string, string> = new Map();
			const getFunctionName = `get${functionName}${i > 0 ? i : ''}`;
			const lastIndex = `${parameters[parameters.length - 1]}`;

			parameters.pop();
			returnFunction.pop();

			const parametersWithLastIndex = [...parameters, lastIndex];

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
				'function_name',
				`${functionName}${i > 0 ? i : ''}`
			);
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
					`return ${i === counterAsterisk - 1
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

		if (definition.get.length > 0) {
			const firstFunctionName = definition.get[0].get('function_name');
			definition.formBuilder = [
				`this.${this.FORM_BUILDER}.array([`,
				`this.${this.CREATE}${firstFunctionName}()`,
				`]),`
			];
		}

		return definition;
	}

	private generateReturnFunction(parameters: string[]): string[] {
		let returnFunction = [...this.dotNotationSplit];
		let count = 0;

		for (let i = 0; i < returnFunction.length; i++) {
			const item = returnFunction[i];
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