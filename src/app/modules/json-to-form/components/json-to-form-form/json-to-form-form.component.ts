import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { html_beautify, js_beautify } from 'js-beautify';
import { Observable, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ArrayValidators } from 'src/app/shared/validators/array.validator';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { ValidatorRuleHelper } from '../../services/angular/validator-rule-helper';
import { JsonValidators } from '../../validators/json.validator';
import { LoadingService } from './../../../../shared/services/loading.service';

@Component({
    selector: 'app-json-to-form-form',
    templateUrl: './json-to-form-form.component.html',
    styleUrls: ['./json-to-form-form.component.scss']
})
export class JsonToFormFormComponent implements OnInit {
    @Input() json: any;
    form!: FormGroup;
    childComponents: FormControl = new FormControl('', []);
    editorOptions: JsonEditorOptions;
    formBuilder$!: Observable<any>;
    isLoadingAction$?: Observable<boolean>;

    @ViewChild(JsonEditorComponent, { static: false }) editor?: JsonEditorComponent;
    constructor(
        private formBuilder: FormBuilder,
        private loadingService: LoadingService
    ) {
        this.editorOptions = new JsonEditorOptions();
        this.editorOptions.mode = 'code'; // set all allowed modes
        this.editorOptions.modes = ['code']; // set all allowed modes
        this.isLoadingAction$ = this.loadingService.isLoadingAction$;
    }

    ngOnInit(): void {
        this.buildForm();
        this.form.markAllAsTouched();
        let componentName: string[] = [];
        this.getComponentChildren().value.forEach((item: any) => {
            componentName.push(item.name);
        });
        this.childComponents.patchValue(componentName.join("\n"));
        this.onChanges();
    }

    public buildForm() {
        this.form = this.formBuilder.group({
            json: [
                this.json,
                [
                    JsonValidators.validateObject()
                ]
            ],
            component_form: this.formBuilder.control('', Validators.required),
            component: this.formBuilder.group({
                name: ['task', [
                    Validators.required,
                    Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)
                ]],
                children: this.formBuilder.array([
                    this.createComponentChildren('form'),
                    this.createComponentChildren('create-edit'),
                    this.createComponentChildren('show'),
                    this.createComponentChildren('table')
                ], [
                    ArrayValidators.minLengthArray(1)
                ]),
            }),
            options: this.formBuilder.group({
                convert_to: [
                    'angular',
                    [Validators.required]
                ]
            })
        });
    }

    onChanges() {
        this.form.get('component.name')?.valueChanges
            .pipe(
                map(value => {
                    return value.trim();
                })
            ).subscribe(value => {
                this.form.get('component.name')?.setValue(value, {
                    emitEvent: false
                });
            })


        this.childComponents.valueChanges
            .pipe(
                //filter(el => el.length > 0),
                distinctUntilChanged(),
                map(value => {
                    return value.split('\n');
                }),
                map((valueArr: any) => {
                    return valueArr.filter((el: any) => el);
                })
            ).subscribe(result => {
                this.getComponentChildren().clear();
                result.forEach((component: string) => {
                    this.getComponentChildren().push(
                        this.createComponentChildren(component)
                    );
                });
            });


        this.formBuilder$ = this.form.valueChanges
            .pipe(
                tap(() => {
                    this.loadingService.isLoading(true)
                }),
                startWith(
                    this.form.value
                ),
                tap((result) => {
                    if (!this.form.valid) {
                        this.loadingService.isLoading(false);
                    }
                }),
                debounceTime(500),
                distinctUntilChanged((a, b) => {
                    if (JSON.stringify(a) === JSON.stringify(b)) {
                        this.loadingService.isLoading(false);
                        return true;
                    }
                    return false;
                }),
                switchMap(value => {
                    if (this.form.valid) {
                        const json = typeof value.json === 'string'
                            ? JSON.parse(value.json)
                            : value.json;
                        const componentName = value.component_form;
                        const reactiveDrivenHtml = new ReactiveDrivenHtml(json);
                        const reactiveDrivenValidator = new ReactiveDrivenValidator(json, componentName);
                        const component = reactiveDrivenValidator.generateComponent();
                        const html = reactiveDrivenHtml.generate();

                        return of({
                            component: js_beautify(component.join("\n")),
                            html: html_beautify(html.join("\n"))
                        });
                    }

                    return of({});
                }),
                tap(() => this.loadingService.isLoading(false))
            );

        merge(
            this.form.get('component.children')!.valueChanges,
            this.form.get('component.name')!.valueChanges
        )
            .pipe(
                tap(() => {
                    this.form.get('component_form')!.patchValue('', {
                        emitEvent: false
                    })
                })
            ).subscribe();
    }

    copy(text: string) {
        alert('still working on it!')
    }

    onSubmit(): void {
        if (this.f.valid) {
        } else {
            this.validateAllFormFields(this.f);
        }
    }

    validateAllFormFields(control: AbstractControl) {
        if (control instanceof FormControl) {
            control.markAsTouched({
                onlySelf: true
            });
        } else if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach((field: string) => {
                const groupControl = control.get(field)!;
                this.validateAllFormFields(groupControl);
            });
        } else if (control instanceof FormArray) {
            const controlAsFormArray = control as FormArray;
            controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
        }
    }

    get f() {
        return this.form;
    }

    getComponentChildren(): FormArray {
        return this.form.get('component.children') as FormArray;
    }

    deleteComponentChildren(indexChildren: number): void {
        this.getComponentChildren().removeAt(indexChildren);
    }

    createComponentChildren(name?: string) {
        return this.formBuilder.group({
            "name": [name, [Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)]],
        });
    }

    isFieldValid(field: string) {
        return !this.f.get(field)?.valid && this.f.get(field)?.touched;
    }

    getField(field: string) {
        return this.f.get(field);
    }

}