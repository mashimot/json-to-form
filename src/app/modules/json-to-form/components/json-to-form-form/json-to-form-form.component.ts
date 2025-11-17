import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, JsonPipe, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
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
import { VALUE_TYPES } from '../../services/angular/models/value.type';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { ValidatorRuleHelper } from '../../services/angular/validator-rule-helper';
import { JsonValidators } from '../../validators/json.validator';
import { LoadingService } from './../../../../shared/services/loading.service';

@Component({
  selector: 'app-json-to-form-form',
  templateUrl: './json-to-form-form.component.html',
  styleUrls: ['./json-to-form-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, NgClass, FormsModule, MonacoEditorModule, JsonPipe],
  animations: [
    trigger('fade', [
      state('false', style({ opacity: 1 })),
      state('true', style({ opacity: 0 })),
      transition('* <=> *', [animate(500)]),
    ]),
  ],
})
export class JsonToFormFormComponent implements OnInit {
  @Input() json: any;

  private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private loadingService: LoadingService = inject(LoadingService);

  private baseOptions = {
    theme: 'vs-dark',
    automaticLayout: true,
    tabSize: 2,
  };
  private editor: monaco.editor.IStandaloneCodeEditor | undefined;
  private decorations: string[] = [];

  public editorOptions = {
    ts: { ...this.baseOptions, language: 'typescript' },
    html: { ...this.baseOptions, language: 'html' },
    json: { ...this.baseOptions, language: 'json' },
  };
  public editorModel: string[] = ['', ''];
  public iconToggle: string[] = ['fa-copy', 'fa-copy'];
  public form!: UntypedFormGroup;
  public childComponents: UntypedFormControl = new UntypedFormControl('', []);
  public inputTypesEnum = Object.values(InputTypeEnum);
  public formBuilder$!: Observable<any>;
  public isLoadingAction$?: Observable<boolean> = this.isLoading$();
  public smartAndDumb: string[] = [
    'ng g m :path: --routing',
    'ng g c :path:/components/:featureName:-form',
    'ng g c :path:/components/:featureName:-list',
    'ng g c :path:/containers/:featureName:',
    'ng g s :path:/services/:featureName:',
    'ng g i :path:/models/:featureName:',
  ];

  ngOnInit(): void {
    this.createForm();
    this.onFormValueChanges();
  }

  private isLoading$(): Observable<boolean> {
    return this.loadingService.getLoading();
  }

  public createForm(): void {
    const input = JSON.stringify(this.json, null, 2);

    this.form = this.formBuilder.group({
      json: [input, [JsonValidators.validateObject()]],
      structure: [1, [Validators.required]],
      featureName: this.formBuilder.control('task', [
        Validators.required,
        Validators.pattern(ValidatorRuleHelper.htmlSelectorRe),
      ]),
      options: this.formBuilder.group({
        formBuildMode: [this.formBuildModes[1].id, [Validators.required]],
        convert_to: ['angular', [Validators.required]],
        framework: ['bootstrap', []],
      }),
      errors: this.formBuilder.control([]),
    });

    this.f.markAllAsTouched();
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editor = editor;
    const model = editor.getModel();

    if (model) {
      monaco.editor.onDidChangeMarkers((e) => {
        if (e.some((uri) => uri.toString() === model.uri.toString())) {
          this.updateErrorHighlights();
        }
      });

      this.updateErrorHighlights();
    }
  }

  private updateErrorHighlights(): void {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (!model) return;

    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const errorMarkers = markers.filter(
      (marker) => marker.severity === monaco.MarkerSeverity.Error,
    );

    const newDecorations: monaco.editor.IModelDeltaDecoration[] = errorMarkers.map((marker) => {
      return {
        range: new monaco.Range(
          marker.startLineNumber,
          1,
          marker.endLineNumber,
          model.getLineMaxColumn(marker.endLineNumber),
        ),
        options: {
          isWholeLine: true,
          className: 'error-line-highlight',
          linesDecorationsClassName: 'error-line-highlight',
        },
      };
    });

    this.decorations = this.editor.deltaDecorations(this.decorations, newDecorations);
    this.setFormErrors(errorMarkers);
  }

  private setFormErrors(errorMarkers: monaco.editor.IMarker[]): void {
    this.f.get('errors')?.setValue(errorMarkers);
  }

  private onFormValueChanges(): void {
    this.formBuilder$ = this.f.valueChanges.pipe(
      tap((response) => this.loadingService.isLoading(true)),
      startWith(this.f.value),
      filter((value) => {
        if (this.f.invalid) {
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
        const errors = this.f.get('errors')?.value || [];
        if (this.f.valid && errors.length <= 0) {
          json = typeof json === VALUE_TYPES.STRING ? JSON.parse(json) : json;

          const reactiveDrivenHtml = new ReactiveDrivenHtml(json, this.options?.value);
          const reactiveDrivenValidator = new ReactiveDrivenValidator(
            json,
            this.featureNamePlusForm,
            this.options?.value,
          );
          const component = reactiveDrivenValidator.generateComponent();
          const html = reactiveDrivenHtml.generate();

          return of({
            component: js_beautify(component.join('\n'), {
              indent_size: 2,
              wrap_line_length: 80,
            }),
            html: html_beautify(html.join('\n'), {
              indent_size: 2,
            }),
          });
        }

        return of({});
      }),
      tap(({ component, html }: { component?: string; html?: string }) => {
        this.editorModel[0] = component || '';
        this.editorModel[1] = html || '';
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
      description: 'Uses Angular’s formBuilder service to create reactive controls.',
      example: 'this.formBuilder.group({}), this.formBuilder.array([]), this.formBuilder.control()',
    },
    {
      id: 'ANGULAR_RAW_INSTANCE',
      label: 'Instance-based API',
      description: 'Creates controls directly using new FormGroup, FormArray, and FormControl.',
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
