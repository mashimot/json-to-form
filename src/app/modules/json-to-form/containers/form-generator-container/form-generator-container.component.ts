import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, JsonPipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { html_beautify, js_beautify } from 'js-beautify';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsModule } from 'primeng/tabs';
import { ToolbarModule } from 'primeng/toolbar';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { VALUE_TYPES } from '../../services/angular/models/value.type';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { ValidatorRuleHelper } from '../../services/angular/validator-rule-helper';
import { JsonToFormService } from '../../services/json-to-form.service';
import { JsonValidators } from '../../validators/json.validator';
import { LoadingService } from './../../../../shared/services/loading.service';

@Component({
  selector: 'app-form-generator-container',
  templateUrl: './form-generator-container.component.html',
  styleUrls: ['./form-generator-container.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    FormsModule,
    MonacoEditorModule,
    JsonPipe,
    TabsModule,
    ToolbarModule,
    ButtonModule,
    CardModule,
    RadioButtonModule,
    InputTextModule,
    OverlayPanelModule,
    MessageModule,
  ],
  animations: [
    trigger('fade', [
      state('false', style({ opacity: 1 })),
      state('true', style({ opacity: 0 })),
      transition('* <=> *', [animate(500)]),
    ]),
  ],
})
export class FormGeneratorContainerComponent implements OnInit {
  private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private loadingService: LoadingService = inject(LoadingService);
  private jsonToFormService = inject(JsonToFormService);
  private route = inject(ActivatedRoute);

  private baseOptions = {
    theme: 'vs-dark',
    automaticLayout: true,
    tabSize: 2,
    fontSize: 12,
  };
  private decorations: string[] = [];
  private editorInputInstance!: monaco.editor.IStandaloneCodeEditor;
  private editorOutputInstance!: monaco.editor.IStandaloneCodeEditor;

  public formExamples$: Observable<any> = this.jsonToFormService.getExamples();
  public editorOptions = {
    ts: { ...this.baseOptions, language: 'typescript', readOnly: true },
    html: { ...this.baseOptions, language: 'html', readOnly: true },
    json: { ...this.baseOptions, language: 'json', minimap: { enabled: false } },
  };
  public iconToggle: { [key: string]: string } = ['pi pi-copy', 'pi pi-copy'].reduce(
    (acc, icon, index) => {
      acc[index.toString()] = icon;
      return acc;
    },
    {} as { [key: string]: string },
  );
  public form!: UntypedFormGroup;
  public html: FormControl = new FormControl('');
  public component: FormControl = new FormControl('');
  public monacoErrors: FormControl = new FormControl(null);
  public output: FormControl = new FormControl('');
  public tabs: any[] = [];
  public activeIndexPreviewTab: number | string = 0;
  public activeIndexJsonTab: string | number = 0;

  ngOnInit(): void {
    this.createForm();
    this.getFormExample();
    this.initializeEditorStreams();
  }

  private initializeEditorStreams(): void {
    combineLatest([
      this.f?.valueChanges.pipe(startWith(this.f?.value)),
      this.monacoErrors.valueChanges.pipe(startWith([])),
    ])
      .pipe(
        debounceTime(10),
        map(([{ json }, monacoErrors]) => {
          return {
            converted: this.convert(json),
            errors: {
              form: this.getFormErrors(),
              monaco: monacoErrors,
            },
          };
        }),
      )
      .subscribe((result) => {
        this.component.setValue(result.converted?.component, { emitEvent: false });
        this.html.setValue(result.converted?.html, { emitEvent: false });
        this.output.setValue(JSON.stringify(result?.errors, null, 2), { emitEvent: false });
      });
  }

  public addTab(): void {
    this.tabs.push({
      name: 'oxi ' + this.tabs.length,
      data: {},
    });

    this.setActive(this.tabs.length);
  }

  public removeTab({ index: i }: { index: number }): void {
    this.tabs.splice(i, 1);
    this.setActive(this.tabs.length - 1);
  }

  public setActive(i: string | number): void {
    this.activeIndexJsonTab = i;
    this.setJsonValue(JSON.stringify(this.tabs[Number(i)]?.data || {}, null, 2));
  }

  public getFormExample(): void {
    this.route.paramMap
      .pipe(
        map((paramMap) => paramMap.get('id')),
        switchMap((id) => {
          return id ? this.jsonToFormService.getExampleByNumber(Number(id)) : of({});
        }),
      )
      .subscribe({
        next: ({ data, name }) => {
          this.tabs = [
            {
              name: name,
              data: data,
            },
          ];
          this.setJsonValue(JSON.stringify(data, null, 2));
        },
      });
  }

  public onInputEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorInputInstance = editor;
    const model = editor.getModel();

    if (model) {
      monaco.editor.onDidChangeMarkers((e) => {
        if (e.some((uri) => uri.toString() === model.uri.toString())) {
          this.syncMarkersToEditor();
        }
      });
    }
  }

  public onOutputEditorInit(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editorOutputInstance = editor;
  }

  public convert(json: any): { component: string; html: string } {
    const newJson = typeof json === VALUE_TYPES.STRING ? JSON.parse(json) : json;

    const reactiveDrivenHtml = new ReactiveDrivenHtml(newJson, this.options?.value);
    const reactiveDrivenValidator = new ReactiveDrivenValidator(
      newJson,
      this.featureNameControl?.value,
      this.options?.value,
    );
    const component = reactiveDrivenValidator.generateComponent();
    const html = reactiveDrivenHtml.generate();

    return {
      component: js_beautify(component.join('\n'), {
        indent_size: 2,
      }),
      html: html_beautify(html.join('\n'), {
        indent_size: 2,
      }),
    };
  }

  private getFormErrors(): string[] {
    const errors = this.jsonControl?.errors;
    return errors ? Object.keys(errors) : [];
  }

  public setJsonValue(string: string): void {
    this.jsonControl?.setValue(string);
  }

  public createForm(): void {
    this.form = this.formBuilder.group({
      json: ['{}', [JsonValidators.validateObject()]],
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
    });

    this.f.markAllAsTouched();
  }

  public syncMarkersToEditor(): void {
    this.monacoErrors.setValue([]);

    if (!this.editorInputInstance) {
      return;
    }

    const modelEditorInput = this.editorInputInstance.getModel();

    if (modelEditorInput) {
      const markers = monaco.editor.getModelMarkers({ resource: modelEditorInput.uri });
      const errorMarkers = markers.filter(
        (marker) => marker.severity === monaco.MarkerSeverity.Error,
      );

      const newDecorations: monaco.editor.IModelDeltaDecoration[] = errorMarkers.map((marker) => {
        return {
          range: new monaco.Range(
            marker.startLineNumber,
            1,
            marker.endLineNumber,
            modelEditorInput.getLineMaxColumn(marker.endLineNumber),
          ),
          options: {
            isWholeLine: true,
            className: 'error-line-highlight',
            linesDecorationsClassName: 'error-line-highlight',
          },
        };
      });

      this.decorations = this.editorInputInstance.deltaDecorations(
        this.decorations,
        newDecorations,
      );
      const errors = errorMarkers.map((error) => {
        return `Erro na linha ${error.startLineNumber}: ${error.message}`;
      });

      if (errors.length > 0) {
        this.monacoErrors.setValue(errors);
      }
    }
  }

  copyToClipboard(val: string = ''): void {
    const index = this.activeIndexPreviewTab;
    this.iconToggle[index] = 'pi pi-check';

    setTimeout(() => {
      this.iconToggle[index] = 'pi pi-copy';
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

  get jsonControl(): UntypedFormControl {
    return this.f?.get('json') as UntypedFormControl;
  }

  get featureNameControl(): UntypedFormControl {
    return this.f?.get('featureName') as UntypedFormControl;
  }

  get featureNameValue(): string {
    return this.f?.get('featureName')?.value;
  }

  get pathControl(): UntypedFormControl {
    return this.f?.get('path') as UntypedFormControl;
  }

  get featureNamePlusForm(): string {
    return `${this.featureNameControl?.value}-form`;
  }

  get options(): UntypedFormGroup {
    return this.f?.get('options') as UntypedFormGroup;
  }

  public isFieldInvalid(field: string): boolean | undefined {
    return this.f?.get(field)?.invalid && this.f.get(field)?.touched;
  }

  public getField(field: string): UntypedFormControl {
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
      description: '*ngIf, *ngFor, *ngSwitch',
      disabled: null,
    },
    // {
    //   id: 2,
    //   type: 'Control Flow Blocks',
    //   description: 'Control Flow Blocks (ex: @if, @for, @switch)',
    //   disabled: true,
    // },
  ];

  private isLoading$(): Observable<boolean> {
    return this.loadingService.getLoading();
  }
}
