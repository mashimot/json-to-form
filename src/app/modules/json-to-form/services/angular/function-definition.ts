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
	private currentValueType: ValueType | undefined;
	private previousValueType: ValueType | undefined;
	private hasReservedWordEnum: boolean = false;
	private formArray: string[] = [];

	private get functionName(): string {
		return ValidatorRuleHelper.camelCasedString(this.dotNotationSplit.join(""));
	}

	private get dotNotationSplit(): string[] {
		return [...ValidatorRuleHelper.dotNotation(this.completeKeyName)];;
	}

	private get parameters(): string[] {
		return [...ValidatorRuleHelper.getParameters(this.completeKeyName)];
	}

	private get path(): string[] {
		return [...ValidatorRuleHelper.getPath(this.completeKeyName)];
	}

	private lowercaseFirstLetter(value: string): string {
		return ValidatorRuleHelper.lowercaseFirstLetter(value);
	}

	private capitalizeFirstLetter(value: string): string {
		return ValidatorRuleHelper.capitalizeFirstLetter(value);
	}

	constructor(
		completeKeyName: string[],
		formBuilderGroup: string[] = [],
		currentValueType?: ValueType | undefined,
		previousValueType?: ValueType | undefined,
	) {
		this.completeKeyName = completeKeyName;
		this.hasReservedWordEnum = completeKeyName.includes(ReservedWordEnum.__ARRAY__) ? true : false;
		this.formBuilderGroup = formBuilderGroup;
		this.currentValueType = currentValueType;
		this.previousValueType = previousValueType; 
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

	public getTotalReservedWords(): number {
		let counterAsterisk = 0;
		this.formArray = [];

		if (this.dotNotationSplit.length > 0) {
			if (this.dotNotationSplit[this.dotNotationSplit.length - 1] === ReservedWordEnum.__ARRAY__) {
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
		const functionName = this.lowercaseFirstLetter(this.functionName);
		const getFunctionName = `get ${functionName}`;
		const path = this.path;

		dataMap.set('has_reserved_word', this.hasReservedWordEnum ? 'S' : 'N');
		dataMap.set('dot_notation', this.dotNotationSplit.join("."));
		dataMap.set('attribute_name', ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true));
		dataMap.set('form_type', this.formType())
		dataMap.set('parameters', `()`);
		dataMap.set('parameters_typed', `()`);
		dataMap.set('parameters_with_last_index', `()`);
		dataMap.set('parameters_with_last_index_typed', `()`);
		dataMap.set('function_name', `${functionName}`);
		dataMap.set('get_function_name', getFunctionName);
		dataMap.set('create_function_name', `${this.CREATE}${this.capitalizeFirstLetter(this.functionName || '')}`);
		dataMap.set('delete_function_name', `${this.DELETE}${this.capitalizeFirstLetter(this.functionName || '')}`);
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

	public get(): Definition {
		const definition: Definition = {
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

	public createFormArrayDataMap(): Map<string, string>[] {
		const counterAsterisk = this.getTotalReservedWords();
	
		if (counterAsterisk <= 0) {
			return [this.createSingleDataMap()];
		}
	
		return this.createMultipleDataMaps(counterAsterisk);
	}
	
	public createSingleDataMap(): Map<string, string> {
		const parameters = this.parameters;
		const path = this.path;
		const lastIndex = this.getLastIndex(parameters);
		const endsWithAsterisk = this.endsWithAsterisk();
		const parametersWithLastIndex = this.getParametersWithLastIndex(parameters, lastIndex);
		const object = {
			has_reserved_word: this.getHasReservedWordEnum(),
			dot_notation: this.dotNotationSplit.join("."),
			attribute_name: this.getAttributeName(),
			form_type: this.formType(),
			parameters: this.formatParameters(parameters),
			parameters_typed: this.formatParametersTyped(parameters),
			parameters_with_last_index: this.formatParameters(parametersWithLastIndex),
			parameters_with_last_index_typed: this.formatParametersTyped(parametersWithLastIndex),
			function_name: this.functionName,
			get_function_name: this.getFunctionName(this.formType()),
			create_function_name: endsWithAsterisk ? this.getCreateFunctionName() : '',
			delete_function_name: endsWithAsterisk ? this.getDeleteFunctionName() : '',
			get_with_parameters: this.getWithParameters(parameters),
			get_at: this.getAt(parameters, lastIndex),
			second_to_last_index: this.getSecondToLastIndex(parameters),
			last_index: lastIndex,
			path: path.join(","),
			full_path: path.join(","),
			first_key_before_dot: this.getFirstKeyBeforeDot(path),
			create: this.getCreateFunction(parameters),
		};

		const dataMap = new Map(Object.entries(object));

		dataMap.set('get_function', '');
		dataMap.set('delete_function', '');
		dataMap.set('delete', '');
		dataMap.set('create_function', '');
		dataMap.set('create', '');

		return dataMap;
	}
	
	private createMultipleDataMaps(counterAsterisk: number): Map<string, string>[] {
		const dataMaps: Map<string, string>[] = [];
		const parameters = this.parameters;
		const path = this.path;

		for (let i = this.formArray.length - 1; i >= 0; i--) {
			const formArray = this.formArray[i];
			const hasAsterisk = formArray === ReservedWordEnum.__ARRAY__;
			const prefix = hasAsterisk && (i > 0) ? i.toString() : '';
			const getFunctionName = `get${this.functionName}${prefix}FormArray`;
			const lastIndex = `${parameters.pop()}`;
			const lastPathIndex = `${path.pop()}`;
			const parametersWithLastIndex = [...parameters, lastIndex];
			const fullPath = [...path, lastPathIndex];
			const object = {
				has_reserved_word: this.getHasReservedWordEnum(),
				attribute_name: this.getAttributeName(i + 1),
				form_type: 'FormArray',
				parameters: this.formatParameters(parameters),
				parameters_typed: this.formatParametersTyped(parameters),
				parameters_with_last_index: this.formatParameters(parametersWithLastIndex as string[]),
				parameters_with_last_index_typed: this.formatParametersTyped(parametersWithLastIndex as string[]),
				function_name: this.functionNameWithPreffix(prefix),
				get_function_name: this.getFunctionName(prefix + 'FormArray'),
				create_function_name: hasAsterisk ? this.getCreateFunctionName(prefix) : '',
				delete_function_name: hasAsterisk ? this.getDeleteFunctionName(prefix) : '',
				get_with_parameters: this.getWithParameters(parameters, prefix + 'FormArray'),
				get_at: this.getAt(parameters, lastIndex as string, prefix),
				second_to_last_index: this.getSecondToLastIndex(parameters),
				last_index: lastIndex || '',
				path: path.join(","),
				full_path: fullPath.join(","),
				first_key_before_dot: this.getFirstKeyBeforeDot(fullPath as string[]),
			};

			const dataMap = new Map(Object.entries(object));
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
							`this.${this.CREATE}${this.functionName}${i + 1}()`,
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

	private functionNameWithPreffix(preffix: string = ''): string {
		return `${this.functionName}${preffix}`;
	}
	
	private getFunctionName(prefix = ''): string {
		return `get${this.functionName}${prefix}`;
	}
	
	private getCreateFunctionName(prefix = ''): string {
		return `${this.CREATE}${this.functionName}${prefix}`;
	}
	
	private getDeleteFunctionName(prefix = ''): string {
		return `${this.DELETE}${this.functionName}${prefix}`;
	}
	
	private getWithParameters(parameters: string[], prefix = ''): string {
		return `${this.getFunctionName(prefix)}(${parameters.join(",")})`;
	}
	
	private getAt(parameters: string[], lastIndex: string, prefix = ''): string {
		return `${this.getWithParameters(parameters, prefix)}.at(${lastIndex})`;
	}
	
	private getAttributeName(suffix: number = 0): string {
		const name = ValidatorRuleHelper.camelCasedString(this.completeKeyName.join("."), true);
		return suffix > 0 ? `${name}${suffix}` : name;
	}
	
	private getHasReservedWordEnum(): string {
		return this.hasReservedWordEnum ? 'S' : 'N';
	}
	
	private formatParameters(parameters: string[]): string {
		return `(${parameters.join(",")})`;
	}
	
	private formatParametersTyped(parameters: string[]): string {
		return `(${parameters.map(p => `${p}:number`).join(",")})`;
	}
	
	private getParametersWithLastIndex(parameters: string[], lastIndex: string): string[] {
		return [...parameters, lastIndex].filter(el => el);
	}
	
	private getLastIndex(parameters: string[]): string {
		return parameters.length > 0 ? parameters[parameters.length - 1] : '';
	}
	
	private endsWithAsterisk(): boolean {
		return this.completeKeyName[this.completeKeyName.length - 1] === ReservedWordEnum.__ARRAY__;
	}
	
	private getSecondToLastIndex(parameters: string[]): string {
		return parameters.length > 0 ? parameters[parameters.length - 1] : '';
	}
	
	private getFirstKeyBeforeDot(path: string[]): string {
		return path.length > 0 ? path[path.length - 1].replace(/'/g, "") : '';
	}
	
	private getCreateFunction(parameters: string[]): string {
		return `${this.getWithParameters(parameters)}.push(${this.getCreateFunctionName()})`;
	}
}