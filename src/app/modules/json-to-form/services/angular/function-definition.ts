import { ReservedWordEnum } from '../../enums/reserved-name.enum';
import { Definition } from './models/Definition';
import { ValueType } from './models/value.type';
import { ValidatorRuleHelper } from './validator-rule-helper';
type DataMapType = {
	parameters: string;
	parameters_typed: string;
	parameters_with_last_index: string;
	parameters_with_last_index_typed: string;
	function_name: string;
	get_function_name: string;
	create_function_name: string;
	delete_function_name: string;
	get_with_parameters: string;
	get_at: string;
	second_to_last_index: string;
	last_index: string;
	path: string;
	get_function: string;
	delete_function: string;
	delete: string;
	create_function: string;
	create: string;
};

export class FormArrayBuilder {
	private CREATE: string = 'create';
	private DELETE: string = 'delete';
	private FORM_BUILDER: string = 'formBuilder';
	private formBuilderGroup: string[] = [];
	private completeKeyName: string[] = [];
	private dotNotationSplit: string[] = [];
	private functionName: string = '';
	private valueType: string;
	private hasReservedWordEnum: boolean = false;

	constructor(
		completeKeyName: string[],
		formBuilderGroup: string[] = [],
		functionName?: string,
		valueType?: any
	) {
		this.completeKeyName = completeKeyName;
		this.hasReservedWordEnum = completeKeyName.includes(ReservedWordEnum.__ARRAY__) ? true : false;
		this.dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyName);
		this.formBuilderGroup = formBuilderGroup;
		this.valueType = valueType;
		this.functionName = functionName || ValidatorRuleHelper.camelCasedString(this.dotNotationSplit.join(""));
	}

	private formType(): 'FormGroup' | 'FormArray' | 'FormControl' | '' {
		switch (this.valueType) {
			case 'object':
				return 'FormGroup'
			case 'array':
				return 'FormArray'
			case 'string':
				return 'FormControl'
		}

		return '';
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

	public createFormGroupDataMap(): Map<string, string> {
		const dataMap: Map<string, string> = new Map();
		const functionName = ValidatorRuleHelper.lowercaseFirstLetter(this.functionName);
		const getFunctionName = `get ${functionName}`;
		const path = [...ValidatorRuleHelper.getPath(this.completeKeyName)];

		dataMap.set('has_reserved_word', this.hasReservedWordEnum ? 'S' : 'N');
		dataMap.set('attribute_name', ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true));
		dataMap.set('form_type', this.formType())
		dataMap.set('parameters', `()`);
		dataMap.set('parameters_typed', `()`);
		dataMap.set('parameters_with_last_index', `()`);
		dataMap.set('parameters_with_last_index_typed', `()`);
		dataMap.set('function_name', `${functionName}`);
		dataMap.set('get_function_name', getFunctionName);
		dataMap.set('create_function_name', `${this.CREATE}${ValidatorRuleHelper.capitalizeFirstLetter(dataMap.get('function_name') || '')}`);
		dataMap.set('delete_function_name', `${this.DELETE}${ValidatorRuleHelper.capitalizeFirstLetter(dataMap.get('function_name') || '')}`);
		dataMap.set('get_with_parameters', `${getFunctionName}()`);
		dataMap.set('get_at', `${getFunctionName}()`);
		dataMap.set('second_to_last_index', '');
		dataMap.set('last_index', '');
		dataMap.set('path', path.join(",")),
		dataMap.set(
			'get_function',
			[
				`${getFunctionName}${dataMap.get('parameters_typed')}: ${dataMap.get('form_type')} {`,
				`return this.f.get(${`[${dataMap.get("path")}]`}) as ${dataMap.get('form_type')};`,
				`}`
			]
				.join("\n")
		);
		dataMap.set(
			'delete_function',
			[
				// `${dataMap.get('delete_function_name')}${dataMap.get('parameters_with_last_index_typed')}:void {`,
				// `this.${dataMap.get('get_with_parameters')}.removeAt(${lastIndex})`,
				// `}`
			].join("\n")
		);
		dataMap.set(
			'delete',
			[
				`${dataMap.get('delete_function_name')}${dataMap.get('parameters_with_last_index')}`
			].join("\n")
		);
		dataMap.set(
			'create_function',
			[
				`${dataMap.get('create_function_name')}() {`,
				`return ${this.formBuilderGroup.join("")}`,
				`}`
			]
				.join("\n")
		);
		dataMap.set(
			'create',
			[
			].join("\n")
		);

		return dataMap;
	}

	private createFormArrayDataMap(): Map<string, string>[] {
		const dataMaps: Map<string, string>[] = [];
		const functionName = this.functionName;
		const counterAsterisk = this.getTotalAsterisks();
		const parameters = [...ValidatorRuleHelper.getParameters(this.completeKeyName)];
		const path = [...ValidatorRuleHelper.getPath(this.completeKeyName)];

		for (let i = counterAsterisk - 1; i >= 0; i--) {
			const dataMap: Map<string, string> = new Map();
			const getFunctionName = `get${functionName}${i > 0 ? i : ''}FormArray`;
			const lastIndex = `${parameters[parameters.length - 1]}`;
			// const attributeName = `${ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true)}${i > 0 ? i : ''}`
			const attributeName = `${ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true)}${i + 1}`
			
			parameters.pop();
			path.pop();

			const parametersWithLastIndex = [...parameters, lastIndex];

			dataMap.set('has_reserved_word', this.hasReservedWordEnum ? 'S' : 'N');
			dataMap.set('attribute_name', attributeName);
			dataMap.set('form_type', this.formType())
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
		console.log('this.createFormArrayDataMap()', this.createFormArrayDataMap())
		const definition: Definition = {
			// get: this.createFormArrayDataMap(),
			// getters: this.createFormGroupDataMap(),
			get: this.hasReservedWordEnum
				? this.createFormArrayDataMap()
				: [this.createFormGroupDataMap()],
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