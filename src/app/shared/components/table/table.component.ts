import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { TableCellContext, TableColumn } from './interfaces/table.interface';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgTemplateOutlet, MatIconModule],
  templateUrl: './table.component.html',
})
export class TableComponent<T> {
  @Input() title = '';
  @Input() icon = '';
  @Input() iconClass = '';
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input() customColumns: string[] = [];
  @Input() emptyMessage = 'No hay registros para mostrar.';
  @Input() showToolbar = false;

  @Input() selectable = false;
  @Output() selectionChange = new EventEmitter<T[]>();
  readonly selected = new Set<T>();

  @Input() paginated = false;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<TableCellContext<T>>;

  private _data: T[] = [];

  @Input()
  set data(rows: T[]) {
    this._data = rows ?? [];
    if (this.selected.size) {
      this.selected.clear();
      this.selectionChange.emit([]);
    }
  }
  get data(): T[] {
    return this._data;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get visiblePages(): (number | null)[] {
    const total = this.totalPages;
    const start = Math.max(1, Math.min(this.page - 2, total - 4));
    const end = Math.min(total, start + 4);
    const pages: (number | null)[] = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    if (start > 1) pages.unshift(...(start > 2 ? [1, null] : [1]));
    if (end < total) pages.push(...(end < total - 1 ? [null, total] : [total]));
    return pages;
  }

  get allSelected(): boolean {
    return this._data.length > 0 && this._data.every(row => this.selected.has(row));
  }

  isCustom(column: TableColumn): boolean {
    return this.customColumns.includes(column.key);
  }

  value(row: T, column: TableColumn): unknown {
    return (row as Record<string, unknown>)[column.key];
  }

  toggleRow(row: T): void {
    if (this.selected.has(row)) this.selected.delete(row);
    else this.selected.add(row);
    this.selectionChange.emit([...this.selected]);
  }

  toggleAll(): void {
    if (this.allSelected) this.selected.clear();
    else this._data.forEach(row => this.selected.add(row));
    this.selectionChange.emit([...this.selected]);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.pageChange.emit(page);
  }
}
