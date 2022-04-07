import { Definition } from './models/Definition';
import { FunctionDefinition } from './function-definition';
import { ValidatorRuleHelper } from './validator-rule-helper';

interface Rules {
  [name: string]: any;
}

export class ReactiveDrivenHtml {
  rules!: any;
  triggerValidationOnSubmit: boolean = true;
  formName: string = 'form';

	constructor(rules: Rules) {
		this.setRules(rules);
	}

	public setFormName(formName: string): void {
		this.formName = formName
	}

	public setTriggerValidationOnSubmit(triggerValidationOnSubmit: boolean): void {
		this.triggerValidationOnSubmit = triggerValidationOnSubmit;
	}

  public generate() : string[] {
	return [
		`<div class="container">`,
		`<form [formGroup]="${this.formName}" (ngSubmit)="onSubmit()">`,
		`<pre>{{ ${this.formName}.value | json }}</pre>`,
		this.reactiveDrivenHtml(this.rules),
		`<button type="submit" class="btn btn-primary">`,
		`Submit`,
		`</button>`,
		`</form>`,
		`</div>`
	];
  }

  public dotNotation: string[] = [];

  public reactiveDrivenHtml(object: { [key: string]: any }, names: string = '', parameters: string[] = [], lastDefinition: any = []): string {
		let drivenHtml = Object.keys(object)
			.map((key: string) => {
				let value = object[key];
				let keyNameSplit = key.split('.');
				let firstKeyNameBeforeDot = keyNameSplit[0];
				let functionDefinition: Definition = {
					get: [],
					lastDefinition: new Map(),
					formBuilder: []
				};
				let rest = names.length > 0 ? '.' + key : key;
				let completeKeyName = (names + rest).split('.');
				const completeKeyNameEndsWithAsterisk = completeKeyName[completeKeyName.length - 1] == '*'
					? true
					: false;
				this.dotNotation = ValidatorRuleHelper.dotNotation(completeKeyName);

				if (key.trim().startsWith('$')) {
					return '';
				}
				
				if (completeKeyNameEndsWithAsterisk) {
		 			parameters = parameters.concat(ValidatorRuleHelper.defineIndexName(completeKeyName, keyNameSplit));
					functionDefinition = new FunctionDefinition(
						parameters,
						completeKeyName
					).get();
					
					if (functionDefinition.lastDefinition.size > 0) {
						lastDefinition.push(functionDefinition);
					}
				}

				if (Object.prototype.toString.call(value) == '[object Object]') {
					if(!completeKeyNameEndsWithAsterisk){
						return [
							`<div formGroupName="${key}">`,
							`${this.reactiveDrivenHtml(value, names + rest, parameters, lastDefinition)}`,
							`</div>`
						]
						.join('\n');
					}

					let formArrayOpenTag: string[] = []
					let formArrayCloseTag: string[] = [];
					functionDefinition.get.forEach((item: Map<string, string>, i: number) => {
						const formArrayName: string = i <= 0
							? `formArrayName="${firstKeyNameBeforeDot}"`
							: `[formArrayName]="${item.get('second_to_last_index')}"`;

						formArrayOpenTag.push(
							`<fieldset ${formArrayName} class="border border-dark p-1">
								<pre>{{ ${item.get('get_with_parameters')}.errors | json }}</pre>
								<div class="btn-group">
									<button type="button" class="btn btn-primary btn-block btn-sm" (click)="${item.get('create')}">ADD ${item.get('function_name')}</button>
								</div>
								<div 
									*ngFor="let ${item.get('function_name')}${i + 1}Data of ${item.get('get_with_parameters')}.controls; let ${/*_parametersAux[pos + (i + 1)]*/ item.get('last_index')} = index;"
									class="border border-dark p-1"
									${
										i == functionDefinition.get.length - 1
											? `[formGroupName]="${item.get('last_index')}"`
											: ``
									}
								>
									<div class="btn-group">
										<button type="button" class="btn btn-danger btn-sm" (click)="${item.get('delete')}">DELETE ${item.get('function_name')}</button>
									</div>`
						);

						formArrayCloseTag.push('</div>');
						formArrayCloseTag.push('</fieldset>');
					});

					const FORM_ARRAY: string[] = [
						formArrayOpenTag.join("\n"),
							`${this.reactiveDrivenHtml(value, names + rest, parameters, lastDefinition)}`,
						formArrayCloseTag.join("\n"),
					];
					
					//refresh the parameters list
					parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
					lastDefinition.pop();

					return FORM_ARRAY.join("\n");
				}
				
				//ex: keyName: []
				if (Array.isArray(value)) {
					let messages: string[] = [];
					const rules = value;
					const keyNameDotNotation: string = completeKeyName.join(".");
					let formControlName = 'formControlName';
					//let getField = `getField('${keyNameDotNotation}')`;
					//let isFieldValid = `isFieldValid('${keyNameDotNotation}')`;
					let getField = ValidatorRuleHelper.camelCasedString(
						this.dotNotation
							.filter((el: string) => el != '*')
							.join(""),
						true		
					);
					let isFieldValid = `isFieldValid('${keyNameDotNotation}')`;
					let get:any = lastDefinition[lastDefinition.length - 1];
					let id = this.dotNotation[this.dotNotation.length - 1];
					var index = firstKeyNameBeforeDot;
					
					//key has asterisk
					if (lastDefinition.length > 0) {
						let getId = `.get('${id}')`;

						if(id == '*'){
							getId = ''
							formControlName = '[formControlName]';
							index = get.lastDefinition.get('last_index');
						} 
						getField = `${get.lastDefinition.get('get_at')}${getId}`;
						isFieldValid = `!${getField}?.valid`
					}

					const ngClass = `[class.is-invalid]="${isFieldValid}"`
					let input: {
						[key:string]: string
					} = {
						'text': `<input type="text" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
						'file': `<input type="file" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
						'password': `<input type="password" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
						'email': `<input type="email" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
						'number': `<input type="number" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
						'date': `<input type="date" ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>`,
						'textarea': `<textarea ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" cols="30" rows="10" ${ngClass}></textarea>`
					};

					let input_html = input.text;

					rules.forEach(rule => {
						const [ruleName, ruleParameters] = ValidatorRuleHelper.parseStringRule(rule);

						messages.push(
							this.getErrorsMessages({ ruleName, ruleParameters, getField, keyNameDotNotation })
						);

						if (ruleName == 'html') {
							input_html = typeof input[ruleParameters[0]] != 'undefined'
								? input[ruleParameters[0]]
								: input.html;

							const keyNameWithoutAsterisk = this.dotNotation.filter((el:string) => el != '*').join("");
							if (ruleParameters[0] == 'select') {
								const options = [
									`<option *ngFor="let data of (${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async)" [ngValue]="data">`,
									`{{ data | json }}`,
									`</option>`
								];
								
								input_html = `<select ${formControlName}="${index}" id="${keyNameDotNotation}" class="form-control" ${ngClass}>${options.join("\n")}</select>`;
							}
							if (ruleParameters[0] == 'radio') {    
								if(id == '*'){
									index = `{{ ${index} }}`;
								}
								input_html = [
									`<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as asyncData">`,
										`<div *ngFor="let data of asyncData; let index${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)} = index;">`,
											`<div class="form-check">`,
												`<input type="radio" formControlName="${index}" [value]="data" ${ngClass}>{{ data | json }}`,
											`</div>`,
										`</div>`,
									`</div>`
								].join("\n");
							}
							if (ruleParameters[0] == 'checkbox') {       
								input_html = [
									`<div *ngIf="(${ValidatorRuleHelper.camelCasedString(keyNameWithoutAsterisk, true)}$ | async) as asyncData">`,
										`<div *ngFor="let data of asyncData; let index${ValidatorRuleHelper.camelCasedString(id)} = index;">`,                                    
											`<div class="form-check">`,
												`<input type="checkbox" ${formControlName}="${index}" class="form-check-input" ${ngClass} [value]="data"> {{ data }}`,
											`</div>`,
										`</div>`,
									`</div>`
								].join("\n");
							}
						}                   
					});

					if (completeKeyNameEndsWithAsterisk) {
						parameters = ValidatorRuleHelper.removeParameters(keyNameSplit, parameters);
						lastDefinition.pop();
						let formArray: string[] = [];
						functionDefinition.get.forEach((item: any, i: number) => {
							let formArrayName: string = i <= 0
								? `formArrayName="${firstKeyNameBeforeDot}"`
								: `[formArrayName]="${item.second_to_last_index}"`;

							formArray.push(
								`<div class="btn-group">
									<button type="button" (click)="${item.get('get_with_parameters')}.push(create${item.get('function_name')}())" class="btn btn-primary btn-sm">add ${item.get('function_name')}</button>
								</div>
								<div
									${formArrayName}
									*ngFor="let h of ${item.get('get_with_parameters')}!.controls; let ${item.get('last_index')} = index;"
								>
									<div class="form-group col-md-12">
										<label for="${id}">${keyNameDotNotation}</label>
										<div class="input-group">
											${input_html}
											<button type="button" (click)="${item.get('delete')}" class="btn btn-danger btn-sm">
												<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete
											</button>
											<div *ngIf="${isFieldValid}" class="invalid-feedback">
												${messages.join("")}
											</div>
										</div>
									</div>
								</div>`
							);
						});

						return formArray.join("\n");
					}

					return [
						`<div class="form-group col-md-12">`,
							`<label for="${id}">${keyNameDotNotation}</label>`,
							`${input_html}`,
							`<div *ngIf="${isFieldValid}" class="invalid-feedback">`,
								`${messages.join("")}`,
							`</div>`,
						`</div>`,
					].join("\n");
				}

				return '';
			}).join("\n");

		return drivenHtml;
  	}

	protected getErrorsMessages({  getField, ruleName, ruleParameters, keyNameDotNotation }: any){
		if (ruleName == 'required') {
			return `<div *ngIf="${getField}!.hasError('required')">${keyNameDotNotation.toUpperCase()} is required</div>`;
		}
		if (ruleName == 'min') {
			return `<div *ngIf="${getField}!.hasError('minlength')">${keyNameDotNotation.toUpperCase()} min must be ${ruleParameters[0]}</div>`
		}
		if (ruleName == 'max') {
			return `<div *ngIf="${getField}!.hasError('maxlength')">${keyNameDotNotation.toUpperCase()} max must be ${ruleParameters[0]}</div>`
		}
		if (ruleName == 'email') {
			return `<div *ngIf="${getField}!.hasError('email')">${keyNameDotNotation.toUpperCase()} an valid Email</div>`;
		}
		
		return '';
	}

	private setRules(rules: Rules) {
		this.rules = ValidatorRuleHelper.splitRules(rules);
	}
}