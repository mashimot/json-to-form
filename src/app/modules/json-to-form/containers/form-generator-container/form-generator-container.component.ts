import { animate, state, style, transition, trigger } from '@angular/animations';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule, JsonPipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
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
import { map, startWith, switchMap } from 'rxjs/operators';
import { VALUE_TYPES } from '../../services/angular/models/value.type';
import { ReactiveDrivenHtml } from '../../services/angular/reactive-driven-html';
import { ReactiveDrivenValidator } from '../../services/angular/reactive-driven-validator';
import { JsonToFormService } from '../../services/json-to-form.service';
import { jsonToTsInterface } from '../../services/json-to-interface';
import { htmlSelectorValidator } from '../../validators/html-selector.validator';
import { validateJsonObject } from '../../validators/json.validator';
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
    ClipboardModule,
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
  private clipboard: Clipboard = inject(Clipboard);

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
  public monacoErrors: FormControl = new FormControl([]);
  public output: FormControl = new FormControl('');
  public tabs: any[] = [];
  public activeIndexPreviewTab: number = 0;
  public activeIndexJsonTab: number = 0;
  public hasAnyErrors: boolean = false;
  public outputTabs: { label: string; value: string }[] = [];
  public editorOptionsMap: Record<string, any> = {
    input: {
      ...this.baseOptions,
      minimap: { enabled: false },
      readOnly: false,
      language: 'json',
    },
    output: {
      ...this.baseOptions,
      readOnly: true,
      minimap: { enabled: true },
      wordWrap: 'on',
      occurrencesHighlight: false,
      renderWhitespace: 'none',
      renderLineHighlight: 'none',
      matchBrackets: 'never',
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      semanticHighlighting: { enabled: true },
      codeLens: false,
      folding: false,
      parameterHints: { enabled: false },
      snippetSuggestions: 'none',
    },
    errors: {
      ...this.baseOptions,
      readOnly: true,
      wordWrap: 'on',
      language: 'typescript',
    },
  };

  ngOnInit(): void {
    this.createForm();
    this.getFormExample();
    this.initializeEditorStreams();
  }

  public setTabPreview(index: number): void {
    this.applyOutputTab(index);
  }

  private updateOutputLanguage(label: string): void {
    this.editorOptionsMap.output = {
      ...this.editorOptionsMap.output,
      language: this.detectLanguage(label),
    };
  }

  private detectLanguage(file: string): string {
    const mappings = [
      { extension: '.html', language: 'html' },
      { extension: '.ts', language: 'typescript' },
    ];

    for (const mapping of mappings) {
      if (file.endsWith(mapping.extension)) {
        return mapping.language;
      }
    }

    return 'plaintext';
  }

  private updatePreview(form: any, errors: string = ''): void {
    const output = form?.converted;
    const baseTabs = [
      { label: 'component.ts', valueKey: 'component' },
      { label: 'template.html', valueKey: 'html' },
      { label: 'interface.ts', valueKey: 'interfaceCode' },
    ];

    this.outputTabs = baseTabs.map((tab) => {
      if (this.hasAnyErrors) {
        return { label: tab.label, value: errors };
      }

      const value = output?.[tab.valueKey] ?? '';
      return { label: tab.label, value: value };
    });

    this.applyOutputTab(this.activeIndexPreviewTab);
  }

  private applyOutputTab(index: number): void {
    const tab = this.outputTabs[index];

    this.activeIndexPreviewTab = index;
    this.updateOutputLanguage(tab.label);

    this.output.setValue(tab.value, { emitEvent: false });
  }

  private initializeEditorStreams(): void {
    combineLatest([
      this.f?.valueChanges.pipe(startWith(this.f?.value)),
      this.monacoErrors?.valueChanges.pipe(startWith(this.monacoErrors.value ?? [])),
    ])
      .pipe(
        map(([{ json }, monacoErrors]) => {
          const hasFormErrors = this.f.status === 'INVALID';
          const hasMonacoErrors = monacoErrors.length > 0;

          this.hasAnyErrors = hasFormErrors || hasMonacoErrors;

          if (this.hasAnyErrors) {
            return {
              converted: null,
              errors: {
                form: this.getRawErrors(),
                monaco: monacoErrors,
              },
            };
          }

          return {
            converted: this.convert(json),
            errors: null,
          };
        }),
      )
      .subscribe({
        next: (result) => {
          this.updatePreview(result, JSON.stringify(result.errors, null, 2));
        },
      });
  }

  private getFormExample(): void {
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

  public formatJson(): void {
    if (!this.editorInputInstance) return;

    this.editorInputInstance.getAction('editor.action.formatDocument').run();
  }

  public onOutputEditorInit(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editorOutputInstance = editor;
  }

  private convert(json: any): { component: string; html: string; interfaceCode: string } {
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
      interfaceCode: js_beautify(jsonToTsInterface(newJson), {
        indent_size: 2,
      }),
    };
  }

  private getRawErrors(): string[] {
    const errors = this.jsonControl?.errors ?? {};
    return errors?.messages ?? [];
  }

  private getFormErrors(control: AbstractControl = this.f): string[] {
    const errors: string[] = [];

    if (control.errors) {
      errors.push(...Object.values(control.errors));
    }

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach((child) => {
        errors.push(...this.getFormErrors(child));
      });
    }

    if (control instanceof FormArray) {
      control.controls.forEach((child) => {
        errors.push(...this.getFormErrors(child));
      });
    }

    return errors;
  }

  public setJsonValue(string: string): void {
    this.jsonControl?.setValue(string);
  }

  public createForm(): void {
    this.form = this.formBuilder.group({
      json: ['{}', [validateJsonObject()]],
      structure: [1, [Validators.required]],
      featureName: this.formBuilder.control('task', [Validators.required, htmlSelectorValidator()]),
      options: this.formBuilder.group({
        formBuildMode: [this.formBuildModes[1].id, [Validators.required]],
        convert_to: ['angular', [Validators.required]],
        framework: ['bootstrap', []],
      }),
    });

    this.f.markAllAsTouched();
  }

  private syncMarkersToEditor(): void {
    this.monacoErrors.setValue([], { emitEvent: true });

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

  public copyToClipboard(content: string = ''): void {
    const index = this.activeIndexPreviewTab;

    this.clipboard.copy(content);
    this.toggleCopyIcon(index);
  }

  private toggleCopyIcon(index: number): void {
    this.iconToggle[index] = 'pi pi-check';
    setTimeout(() => {
      this.iconToggle[index] = 'pi pi-copy';
    }, 800);
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
