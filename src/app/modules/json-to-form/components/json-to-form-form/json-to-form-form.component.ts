import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { html_beautify, js_beautify } from 'js-beautify';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap, tap } from 'rxjs/operators';
import { InputTypeEnum } from '../../enums/input-type.enum';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { ValidatorRuleHelper } from '../../services/angular/validator-rule-helper';
import { JsonValidators } from '../../validators/json.validator';
import { LoadingService } from './../../../../shared/services/loading.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-json-to-form-form',
    templateUrl: './json-to-form-form.component.html',
    styleUrls: ['./json-to-form-form.component.scss'],
    animations: [  
        trigger('fade', [
            state('false', style({ opacity:1 })),
            state('true', style({ opacity:0 })),
            transition('* <=> *',[
                animate(500)
            ])
        ])
    ]
})
export class JsonToFormFormComponent implements OnInit {
    @Input() json: any;

    @ViewChild(JsonEditorComponent, { static: false }) editor?: JsonEditorComponent;

    public state:boolean = false;
    public form!: UntypedFormGroup;
    public childComponents: UntypedFormControl = new UntypedFormControl('', []);
    public editorOptions: JsonEditorOptions;
    public formBuilder$!: Observable<any>;
    public isLoadingAction$?: Observable<boolean>;
    public smartAndDumb: string[] = [
        'ng g m :path: --routing',
        'ng g c :path:/components/:feature_name:-form',
        'ng g c :path:/components/:feature_name:-list',
        'ng g c :path:/containers/:feature_name:',
        'ng g s :path:/services/:feature_name:',
        'ng g i :path:/models/:feature_name:',
    ];
    public inputTypesEnum = Object.values(InputTypeEnum);

    constructor(
        private formBuilder: UntypedFormBuilder,
        private loadingService: LoadingService
    ) {
        this.editorOptions = new JsonEditorOptions();
        this.editorOptions.mode = 'code'; // set all allowed modes
        this.editorOptions.modes = ['code']; // set all allowed modes
        this.isLoadingAction$ = this.loadingService.isLoadingAction$;
    }

    ngOnInit(): void {
        this.buildForm();
        this.onChanges();
    }

    public buildForm(): void {
        this.form = this.formBuilder.group({
            json: [
                this.json,
                [JsonValidators.validateObject()]
            ],
            path: this.formBuilder.control(
                'modules/tasks', 
                [
                    Validators.required,
                    Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)
                ]
            ),
            feature_name: this.formBuilder.control(
                'task', 
                [
                    Validators.required,
                    Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)
                ]
            ),
            options: this.formBuilder.group({
                convert_to: [
                    'angular',
                    [Validators.required]
                ]
            })
        });
        this.form.markAllAsTouched();
    }

    onChanges(): void {
        this.formBuilder$ = this.form.valueChanges
            .pipe(
                tap(response => {
                    this.loadingService.isLoading(true)
                }),
                startWith(this.form.value),
                filter(value => {
                    if (this.form.invalid) {
                        this.loadingService.isLoading(false);
                        return false;
                    }

                    return true;
                }),
                debounceTime(600),
                distinctUntilChanged((a, b) => {
                    if (JSON.stringify(a) === JSON.stringify(b)) {
                        this.loadingService.isLoading(false);
                        return true;
                    }
                    
                    return false;
                }),
                switchMap(({ json, feature_name }) => {
                    if (this.form.valid) {
                        json = typeof json === 'string'
                            ? JSON.parse(json)
                            : json;
                        const reactiveDrivenHtml = new ReactiveDrivenHtml(json);
                        const reactiveDrivenValidator = new ReactiveDrivenValidator(json, this.featureNamePlusForm);
                        const component = reactiveDrivenValidator.generateComponent();
                        const html = reactiveDrivenHtml.generate();

                        return of({
                            component: js_beautify(component.join("\n")),
                            // html: '',
                            html: html_beautify(html.join("\n"))
                        });
                    }

                    return of({});
                }),
                tap(() => this.loadingService.isLoading(false))
            );
    }

    copyToClipboard(val: string): void {
        this.state = !this.state

        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    onSubmit(): void {
        if (this.f.valid) {
        } else {
            this.validateAllFormFields(this.f);
        }
    }

    validateAllFormFields(control: AbstractControl): void {
        if (control instanceof UntypedFormControl) {
            control.markAsTouched({
                onlySelf: true
            });
        } else if (control instanceof UntypedFormGroup) {
            Object.keys(control.controls).forEach((field: string) => {
                const groupControl = control.get(field)!;
                this.validateAllFormFields(groupControl);
            });
        } else if (control instanceof UntypedFormArray) {
            const controlAsFormArray = control as UntypedFormArray;
            controlAsFormArray.controls.forEach((arrayControl: AbstractControl) => this.validateAllFormFields(arrayControl));
        }
    }

    get f(): UntypedFormGroup {
        return this.form as UntypedFormGroup;
    }

    get featureName(): UntypedFormControl {
        return this.f.get('feature_name') as UntypedFormControl;
    }

    get path(): UntypedFormControl {
        return this.f.get('path') as UntypedFormControl;
    }

    get featureNamePlusForm(): string {
        return `${this.featureName?.value}-form`;
    }

    isFieldValid(field: string): boolean | undefined {
        return !this.f.get(field)?.valid && this.f.get(field)?.touched;
    }

    getField(field: string): UntypedFormControl {
        return this.f.get(field) as UntypedFormControl;
    }

}