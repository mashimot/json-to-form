import { ReservedWordEnum } from '../../enums/reserved-name.enum';
import { Definition } from './models/Definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

export class FormArrayBuilder {
	private CREATE: string = 'create';
	private DELETE: string = 'delete';
	private FORM_BUILDER: string = 'formBuilder';
	private formBuilderGroup: string[] = [];
	private completeKeyName: string[] = [];
	private dotNotationSplit: string[] = [];
	private functionName: string = '';

	constructor(
		completeKeyName: string[],
		formBuilderGroup: string[] = [],
		functionName?: string
	) {
		this.completeKeyName = completeKeyName;
		this.dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyName);
		this.formBuilderGroup = formBuilderGroup;
		this.functionName = functionName || ValidatorRuleHelper.camelCasedString(this.dotNotationSplit.join(""));
	}

	private getTotalAsterisks(): number {
		let counterAsterisk = 0;
		for (let i = this.dotNotationSplit.length - 1; i >= 0; i--) {
			if (this.dotNotationSplit[i] !== ReservedWordEnum.__ARRAY__) {
				break;
			}
			counterAsterisk++;
		}

		return counterAsterisk;
	}

	private createDataMap(): Map<string, string>[] {
		const dataMaps: Map<string, string>[] = [];
		const functionName = this.functionName;
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

			dataMap.set('parameters', `(${parameters.join(",")})`);
			dataMap.set('parameters_typed', `(${parameters.map(p => `${p}:number`).join(",")})`);
			dataMap.set('parameters_with_last_index', `(${parametersWithLastIndex.join(",")})`);
			dataMap.set('parameters_with_last_index_typed', `(${parametersWithLastIndex.map(p => `${p}:number`).join(",")})`);
			dataMap.set('function_name', `${functionName}${i > 0 ? i : ''}`);
			dataMap.set('get_function_name', getFunctionName);
			dataMap.set('create_function_name', `${this.CREATE}${dataMap.get('function_name')}`);
			dataMap.set('delete_function_name', `${this.DELETE}${dataMap.get('function_name')}`);
			dataMap.set('get_with_parameters', `${getFunctionName}(${parameters.join(",")})`);
			dataMap.set('get_at', `${getFunctionName}(${parameters.join(",")}).at(${lastIndex})`);
			dataMap.set('second_to_last_index', parameters[parameters.length - 1]);
			dataMap.set('last_index', lastIndex);
			dataMap.set('path', path.join(",")),
				dataMap.set(
					'get_function',
					[
						`${getFunctionName}${dataMap.get('parameters_typed')}: FormArray {`,
						`return this.f.get(${`[${dataMap.get("path")}]`}) as FormArray;`,
						`}`
					]
						.join("\n")
				);
			dataMap.set(
				'delete_function',
				[
					`${dataMap.get('delete_function_name')}${dataMap.get('parameters_with_last_index_typed')}:void {`,
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

			dataMaps.unshift(dataMap);
		};

		return dataMaps;
	}

	public get(): Definition {
		const definition: Definition = {
			get: this.createDataMap(),
			formBuilder: []
		};

		if (definition.get.length > 0) {
			const firstCreateFunctionName = definition.get[0].get('create_function_name');
			definition.formBuilder = [
				`this.${this.FORM_BUILDER}.array([`,
				`this.${firstCreateFunctionName}()`,
				`]),`
			];
		}

		return definition;
	}
}