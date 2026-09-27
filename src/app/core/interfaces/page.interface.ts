export interface Page<T> {
  content: T[];
  page: PageMeta;
}

export interface PageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}
