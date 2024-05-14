import { Definition } from './models/Definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

export class FunctionDefinition {
	private CREATE: string = 'create';
	private DELETE: string = 'delete';
	private FORM_BUILDER: string = 'formBuilder';
	private formBuilderGroup: string[] = [];
	private completeKeyName: string[] = [];
	private dotNotationSplit: string[] = [];

	constructor(
		completeKeyName: string[],
		formBuilderGroup: string[] = []
	) {
		this.completeKeyName = completeKeyName;
		this.dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyName);
		this.formBuilderGroup = formBuilderGroup;
	}

	private getTotalAsterisks(): number {
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
		const definition: Definition = {
			get: [],
			formBuilder: []
		};
		const functionName = ValidatorRuleHelper.camelCasedString(this.dotNotationSplit.join(""));
		const counterAsterisk = this.getTotalAsterisks();
		const parameters = [...ValidatorRuleHelper.getParameters(this.completeKeyName)];
		const path = [...ValidatorRuleHelper.getField(this.completeKeyName)];

		for (let i = counterAsterisk - 1; i >= 0; i--) {
			const dataMap: Map<string, string> = new Map();
			const getFunctionName = `get${functionName}${i > 0 ? i : ''}FormArray`;
			const lastIndex = `${parameters[parameters.length - 1]}`;

			parameters.pop();
			path.pop();

			const parametersWithLastIndex = [...parameters, lastIndex];
			//(index1, index2)
			dataMap.set(
				'parameters',
				`(${parameters.map((p: string) => `${p}`).join(",")})`
			);
			//(index1: number, index2: number)
			dataMap.set(
				'parameters_typed',
				`(${parameters.map((p: string) => `${p}:number`).join(",")})`
			);
			//(index1, index2)
			dataMap.set(
				'parameters_with_last_index',
				`(${parametersWithLastIndex.map((p: string) => `${p}`).join(",")})`
			);
			//(index1: number, index2: number, index3: number)
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
				`${getFunctionName}${dataMap.get('parameters')}`
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
					// `return ${parameters.map(() => '(').join("")}${returnFunction.join("")} as FormArray;`,
					`return this.f.get(${`[${path.join(",")}]`}) as FormArray;`,
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
}