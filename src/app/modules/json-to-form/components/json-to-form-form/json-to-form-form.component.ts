import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  JsonEditorComponent,
  JsonEditorOptions,
  NgJsonEditorModule,
} from 'ang-jsoneditor';
import { html_beautify, js_beautify } from 'js-beautify';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { InputTypeEnum } from '../../enums/input-type.enum';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { ValidatorRuleHelper } from '../../services/angular/validator-rule-helper';
import { JsonValidators } from '../../validators/json.validator';
import { LoadingService } from './../../../../shared/services/loading.service';

@Component({
    selector: 'app-json-to-form-form',
    templateUrl: './json-to-form-form.component.html',
    styleUrls: ['./json-to-form-form.component.scss'],
    imports: [
        CommonModule,
        NgJsonEditorModule,
        ReactiveFormsModule,
        NgClass,
    ],
    animations: [
        trigger('fade', [
            state('false', style({ opacity: 1 })),
            state('true', style({ opacity: 0 })),
            transition('* <=> *', [animate(500)]),
        ]),
    ]
})
export class JsonToFormFormComponent implements OnInit {
  @Input() json: any;

  @ViewChild(JsonEditorComponent, { static: false })
  editor?: JsonEditorComponent;

  private formBuilder = inject(UntypedFormBuilder);
  private loadingService = inject(LoadingService);

  public iconToggle: string[] = ['fa-copy', 'fa-copy'];
  public form!: UntypedFormGroup;
  public childComponents: UntypedFormControl = new UntypedFormControl('', []);
  public inputTypesEnum = Object.values(InputTypeEnum);
  public editorOptions: JsonEditorOptions;
  public formBuilder$!: Observable<any>;
  public isLoadingAction$?: Observable<boolean>;
  public smartAndDumb: string[] = [
    'ng g m :path: --routing',
    'ng g c :path:/components/:featureName:-form',
    'ng g c :path:/components/:featureName:-list',
    'ng g c :path:/containers/:featureName:',
    'ng g s :path:/services/:featureName:',
    'ng g i :path:/models/:featureName:',
  ];

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code'; // set all allowed modes
    this.editorOptions.modes = ['code']; // set all allowed modes
    this.isLoadingAction$ = this.loadingService.isLoadingAction$;
    this.editorOptions = {
      ...this.editorOptions,
    };
  }

  ngOnInit(): void {
    this.buildForm();
    this.onChanges();
  }

  public buildForm(): void {
    const input = this.json;

    this.form = this.formBuilder.group({
      json: [input, [JsonValidators.validateObject()]],
      structure: [1, [Validators.required]],
      // path: this.formBuilder.control(
      //     'modules/tasks',
      //     [
      //         Validators.required,
      //         Validators.pattern(ValidatorRuleHelper.htmlSelectorRe)
      //     ]
      // ),
      featureName: this.formBuilder.control('task', [
        Validators.required,
        Validators.pattern(ValidatorRuleHelper.htmlSelectorRe),
      ]),
      options: this.formBuilder.group({
        formBuildMode: [this.formBuildModes[1].id, [Validators.required]],
        // convert_to: ['angular', [Validators.required]],
        framework: ['bootstrap', []],
      }),
    });
    this.form.markAllAsTouched();
  }

  onChanges(): void {
    this.formBuilder$ = this.form.valueChanges.pipe(
      tap((response) => this.loadingService.isLoading(true)),
      startWith(this.form.value),
      filter((value) => {
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
      switchMap(({ json, featureName }) => {
        if (this.form.valid) {
          json = typeof json === 'string' ? JSON.parse(json) : json;

          const reactiveDrivenHtml = new ReactiveDrivenHtml(
            json,
            this.options?.value,
          );
          const reactiveDrivenValidator = new ReactiveDrivenValidator(
            json,
            this.featureNamePlusForm,
            this.options?.value,
          );
          const component = reactiveDrivenValidator.generateComponent();
          const html = reactiveDrivenHtml.generate();

          return of({
            // component: '',
            // html: '',
            component: js_beautify(component.join('\n')),
            html: html_beautify(html.join('\n')),
          });
        }

        return of({});
      }),
      tap(() => this.loadingService.isLoading(false)),
    );
  }

  copyToClipboard(val: string, index: number): void {
    this.iconToggle[index] = 'fa-check';

    setTimeout(() => {
      this.iconToggle[index] = 'fa-copy';
    }, 800);

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
        onlySelf: true,
      });
    } else if (control instanceof UntypedFormGroup) {
      Object.keys(control.controls).forEach((field: string) => {
        const groupControl = control.get(field)!;
        this.validateAllFormFields(groupControl);
      });
    } else if (control instanceof UntypedFormArray) {
      const controlAsFormArray = control as UntypedFormArray;
      controlAsFormArray.controls.forEach((arrayControl: AbstractControl) =>
        this.validateAllFormFields(arrayControl),
      );
    }
  }

  get f(): UntypedFormGroup {
    return this.form as UntypedFormGroup;
  }

  get featureName(): UntypedFormControl {
    return this.f?.get('featureName') as UntypedFormControl;
  }

  get path(): UntypedFormControl {
    return this.f?.get('path') as UntypedFormControl;
  }

  get featureNamePlusForm(): string {
    return `${this.featureName?.value}-form`;
  }

  get options(): UntypedFormGroup {
    return this.f?.get('options') as UntypedFormGroup;
  }

  isFieldInvalid(field: string): boolean | undefined {
    return this.f?.get(field)?.invalid && this.f.get(field)?.touched;
  }

  getField(field: string): UntypedFormControl {
    return this.f?.get(field) as UntypedFormControl;
  }

  public formBuildModes = [
    {
      id: 'ANGULAR_FORM_BUILDER',
      label: 'FormBuilder API',
      description:
        'Uses Angular’s formBuilder service to create reactive controls.',
      example:
        'this.formBuilder.group({}), this.formBuilder.array([]), this.formBuilder.control()',
    },
    {
      id: 'ANGULAR_RAW_INSTANCE',
      label: 'Instance-based API',
      description:
        'Creates controls directly using new FormGroup, FormArray, and FormControl.',
      example: 'new FormGroup({}), new FormArray([]), new FormControl()',
    },
  ];

  public formControlType = [
    {
      id: 1,
      type: 'Structural Directives',
      description: 'Structural Directives (ex: *ngIf, *ngFor, *ngSwitch)',
      disabled: null,
    },
    // {
    //     id: 2,
    //     type: 'Control Flow Blocks',
    //     description: 'Control Flow Blocks (ex: @if, @for, @switch)',
    //     disabled: true
    // }
  ];
}
