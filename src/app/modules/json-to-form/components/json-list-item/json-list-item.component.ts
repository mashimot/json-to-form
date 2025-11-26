import { JsonPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-json-list-item',
  templateUrl: './json-list-item.component.html',
  styleUrls: ['./json-list-item.component.css'],
  imports: [JsonPipe, NgClass, CardModule],
})
export class JsonListItemComponent implements OnInit {
  @Input() item!: any;
  @Input() index: number = 0;

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
