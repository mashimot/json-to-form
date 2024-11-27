import { ReservedWordEnum } from '../../enums/reserved-name.enum';
import { Definition } from './models/Definition';
import { ValueType } from './models/value.type';
import { ValidatorRuleHelper } from './validator-rule-helper';

export class FormArrayBuilder {
	private CREATE: string = 'create';
	private DELETE: string = 'delete';
	private FORM_BUILDER: string = 'formBuilder';
	private formBuilderGroup: string[] = [];
	private completeKeyName: string[] = [];
	private dotNotationSplit: string[] = [];
	// private functionName: string = '';
	private currentValueType: string;
	private hasReservedWordEnum: boolean = false;
	private previousValueType: string;

	constructor(
		completeKeyName: string[],
		formBuilderGroup: string[] = [],
		currentValueType?: any,
		previousValueType?: any
	) {
		this.completeKeyName = completeKeyName;
		this.hasReservedWordEnum = completeKeyName.includes(ReservedWordEnum.__ARRAY__) ? true : false;
		this.dotNotationSplit = ValidatorRuleHelper.dotNotation(completeKeyName);
		this.formBuilderGroup = formBuilderGroup;
		this.currentValueType = currentValueType;
		this.previousValueType = previousValueType; 
	}

	public get functionName(): string {
		return ValidatorRuleHelper.camelCasedString(this.dotNotationSplit.join(""));
	}

	private formType(valueType?: ValueType): 'FormGroup' | 'FormArray' | 'FormControl' | '' {
		switch (valueType === undefined ? this.currentValueType : valueType) {
			case 'object':
				return 'FormGroup'
			case 'array':
				return 'FormArray'
			case 'string':
				return 'FormControl'
		}

		return '';
	}
	
	public formArray: string[] = [];

	public getTotalAsterisks(): number {
		let counterAsterisk = 0;
		this.formArray = [];

		if(this.dotNotationSplit.length > 0) {
			if(this.dotNotationSplit[this.dotNotationSplit.length - 1] === ReservedWordEnum.__ARRAY__) {
				for (let i = this.dotNotationSplit.length - 1; i >= 0; i--) {
					const item = this.dotNotationSplit[i];
	
					if (this.dotNotationSplit[i] !== ReservedWordEnum.__ARRAY__) {
						this.formArray.push(item);
						break;
					}

					this.formArray.push(item);
					counterAsterisk++;
				}
			} 
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
		dataMap.set('full_path', path.join(",")),
		dataMap.set('first_key_before_dot', path[path.length - 1].replace(/'/g, ""));
		dataMap.set(
			'get_function',
			[
				`${getFunctionName}${dataMap.get('parameters_typed')}: ${dataMap.get('form_type')} {`,
				`return this.f.get(${`[${dataMap.get("path")}]`}) as ${dataMap.get('form_type')};`,
				`}`
			]
				// .join("\n")
				.join("")
		);
		dataMap.set(
			'delete_function',
			[
				// `${dataMap.get('delete_function_name')}${dataMap.get('parameters_with_last_index_typed')}:void {`,
				// `this.${dataMap.get('get_with_parameters')}.removeAt(${lastIndex})`,
				// `}`
			]
			// .join("\n")
				.join("")
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

	public createFormArrayDataMap(): Map<string, string>[] {
		const dataMaps: Map<string, string>[] = [];
		const functionName = this.functionName;
		const counterAsterisk = this.getTotalAsterisks(); 
		const parameters = [...ValidatorRuleHelper.getParameters(this.completeKeyName)];
		const path = [...ValidatorRuleHelper.getPath(this.completeKeyName)];

		if(counterAsterisk <= 0) {
			const endsWithHue = this.completeKeyName[this.completeKeyName.length - 1] === ReservedWordEnum.__ARRAY__ ? true : false
			const dataMap: Map<string, string> = new Map();
			const getFunctionName = `get${functionName}${this.formType()}`;
			const lastIndex = `${parameters.length > 0 ? parameters[parameters.length - 1] : ''}`;
			const attributeName = `${ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true)}`
			const parametersWithLastIndex = [...(parameters || []), lastIndex].filter(el => el) || [];

			dataMap.set('has_reserved_word', this.hasReservedWordEnum ? 'S' : 'N');
			dataMap.set('attribute_name', attributeName);
			dataMap.set('form_type', this.formType())
			dataMap.set('parameters', `(${parameters.join(",")})`);
			dataMap.set('parameters_typed', `(${parameters.length > 0 ? parameters.map(p => `${p}:number`).join(",") : ''})`);
			dataMap.set('parameters_with_last_index', `(${parametersWithLastIndex.length > 0 ? parametersWithLastIndex.join(",") : ''})`);
			dataMap.set('parameters_with_last_index_typed', `(${parametersWithLastIndex.length > 0 ? parametersWithLastIndex.map(p => `${p}:number`).join(",") : ''})`);
			dataMap.set('function_name', `${functionName}`);
			dataMap.set('get_function_name', getFunctionName);
			dataMap.set('create_function_name', endsWithHue ? `${this.CREATE}${dataMap.get('function_name')}` : '');
			dataMap.set('delete_function_name', endsWithHue ? `${this.DELETE}${dataMap.get('function_name')}` : '');
			dataMap.set('get_with_parameters', `${getFunctionName}(${parameters.join(",")})`);
			dataMap.set('get_at', `${getFunctionName}(${parameters.join(",")}).at(${lastIndex})`);
			dataMap.set('second_to_last_index', parameters.length > 0 ? parameters[parameters.length - 1] : '');
			dataMap.set('last_index', lastIndex);
			dataMap.set('path', path.join(",")),
			dataMap.set('full_path', path.join(",")),
			dataMap.set('first_key_before_dot', path[path.length - 1].replace(/'/g, ""));
			dataMap.set(
				'get_function',
				[
					//AHEUAEHUHUEAUHEUHAEHUEUH
					// `${getFunctionName}${dataMap.get('parameters_typed')}: ${this.formType()} {`,
					// `return this.f.get(${`[${dataMap.get("path")}]`}) as ${this.formType()};`,
					// `}`
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
					`${this.DELETE}${dataMap.get('function_name')}${dataMap.get('parameters_with_last_index')}`
				].join("\n")
			);
			dataMap.set(
				'create_function',
				[
					// `${this.CREATE}${dataMap.get('function_name')}(){`,
					// `return ${this.formBuilderGroup.join("")}`,
					// `}`
				]
					.join("\n")
			);
			dataMap.set(
				'create',
				[
					`${dataMap.get('get_with_parameters')}.push(${this.CREATE}${dataMap.get('function_name')}())`
				].join("\n")
			);

			return [dataMap];
		}

		for(let i = this.formArray.length - 1; i >= 0; i--){
			const bunda = this.formArray[i];
			const oi = bunda === ReservedWordEnum.__ARRAY__;
			const ass = oi && (i > 0) ? i : '';
			const dataMap: Map<string, string> = new Map();
			const getFunctionName = `get${functionName}${ass}FormArray`;
			const lastIndex = `${parameters[parameters.length - 1]}`;
			const lastPathIndex = `${path[path.length - 1]}`;
			const attributeName = `${ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true)}${i + 1}`
			
			parameters.pop();
			path.pop();

			const parametersWithLastIndex = [...parameters, lastIndex];
			const fullPath = [...path, lastPathIndex];

			dataMap.set('has_reserved_word', this.hasReservedWordEnum ? 'S' : 'N');
			dataMap.set('attribute_name', attributeName);
			dataMap.set('form_type', 'FormArray')
			dataMap.set('parameters', `(${parameters.join(",")})`);
			dataMap.set('parameters_typed', `(${parameters.map(p => `${p}:number`).join(",") })`);
			dataMap.set('parameters_with_last_index', `(${parametersWithLastIndex.join(",") || ''})`);
			dataMap.set('parameters_with_last_index_typed', `(${parametersWithLastIndex.map(p => `${p}:number`).join(",") || ''})`);
			dataMap.set('function_name', `${functionName}${ass}`);
			dataMap.set('get_function_name', getFunctionName);
			dataMap.set('create_function_name', oi ? `${this.CREATE}${dataMap.get('function_name')}` : '');
			dataMap.set('delete_function_name', `${this.DELETE}${dataMap.get('function_name')}`);
			dataMap.set('get_with_parameters', `${getFunctionName}(${parameters.join(",")})`);
			dataMap.set('get_at', `${getFunctionName}(${parameters.join(",")}).at(${lastIndex})`);
			dataMap.set('second_to_last_index', parameters[parameters.length - 1]);
			dataMap.set('last_index', lastIndex);
			dataMap.set('path', path.join(",")),
			dataMap.set('full_path', fullPath.join(",")),
			dataMap.set('first_key_before_dot', (fullPath.length > 0 ? fullPath[fullPath.length - 1] : '').replace(/'/g, ""));
			dataMap.set(
				'get_function',
				[
					`${getFunctionName}${dataMap.get('parameters_typed')}: FormArray {`,
					`return this.f.get(${`[${dataMap.get("full_path")}]`}) as FormArray;`,
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
			// get: this.createFormArrayDataMap(),
			// getters: this.createFormGroupDataMap(),
			get: this.hasReservedWordEnum
				? this.createFormArrayDataMap()
				: [this.createFormGroupDataMap()],
			formBuilder: []
		};

		console.log('-> ',definition.get);

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