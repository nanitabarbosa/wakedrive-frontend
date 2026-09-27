export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableCellContext<T> {
  $implicit: T;
  column: TableColumn;
  index: number;
}
