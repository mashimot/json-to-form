import { JsonPipe, NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-json-to-form-list',
  templateUrl: './json-to-form-list.component.html',
  styleUrls: ['./json-to-form-list.component.css'],
  standalone: true,
  imports: [JsonPipe, NgFor, NgClass],
})
export class JsonToFormListComponent implements OnInit {
  @Input() formExamples!: any;

  @Output() edit: EventEmitter<number> = new EventEmitter();
  @Output() create: EventEmitter<void> = new EventEmitter();

  hoverEffect: string[] = [];

  constructor() {}

  ngOnInit(): void {}

  public createJsonToForm(): void {
    this.create.emit();
  }

  public editJsonToForm(id: number): void {
    this.edit.emit(id);
  }
}
